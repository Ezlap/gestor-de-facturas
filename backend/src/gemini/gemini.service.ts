import { BadGatewayException, Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { ConfigService } from "@nestjs/config";
import { DatosFactura, DatosFacturaSchema } from "./datos-factura.schema";

const PROMPT = `Eres un extractor de datos de facturas de servicios (energía, agua, telecomunicaciones, etc.).
Devuelve únicamente JSON que cumpla el esquema. Reglas:
- Las facturas son de Colombia: las fechas numéricas como 03/04/2026 se leen día/mes/año (3 de abril).
- Acepta cualquier formato de fecha del documento (2026/11/15, 15-nov-2026, 15 de noviembre de 2026) y conviértelo a YYYY-MM-DD.
- "fechaEmision" es la fecha en que se expidió la factura (puede aparecer como "fecha de emisión", "fecha de expedición" o "fecha de factura"). No la confundas con el periodo facturado ni con la fecha de corte.
- "fechaLimitePago" es la fecha de vencimiento ("pague antes de", "fecha límite de pago"). Si no hay una fecha explícita, usa null.
- Si una fecha trae solo mes y año, o no se puede determinar con certeza, usa null en vez de adivinar el día.
- "total" es el valor total A PAGAR de esta factura (no subtotales ni saldos anteriores).
- Los números van con punto decimal y sin separadores de miles (1.234.567,89 se escribe 1234567.89).
- "moneda" es el código ISO de 3 letras (COP, USD, EUR...).
- Las fechas van en formato estricto YYYY-MM-DD.
- Si un dato opcional no aparece en el documento, usa null. No inventes ni adivines datos.`;

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private readonly ai: GoogleGenAI;
    private readonly model: string;

constructor(config: ConfigService) {
    this.ai = new GoogleGenAI({ apiKey: config.getOrThrow<string>('LLM_API_KEY')});
    this.model = config.getOrThrow<string>('LLM_MODEL');
}

async analizarFactura(buffer: Buffer, mimeType: string): Promise<{ datos: DatosFactura; bruto: string}> {
    let bruto: string | undefined;
    try {
        const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
            { inlineData: { data: buffer.toString('base64'), mimeType} },
            { text: PROMPT },
        ],
        config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW},
            responseMimeType: 'application/json',
            responseSchema: {
            type: Type.OBJECT,
            properties: {
                proveedor: { type: Type.STRING },
                numeroFactura: { type: Type.STRING },
                fechaEmision: { type: Type.STRING, description: 'YYYY-MM-DD'},
                fechaLimitePago: { type: Type.STRING, nullable: true, description: 'YYYY-MM-DD'},
                total: { type: Type.NUMBER },
                moneda: { type: Type.STRING, description: 'Código ISO de 3 letras'},
                    numeroCliente: { type: Type.STRING, nullable: true},
            },
            required: ['proveedor', 'numeroFactura', 'fechaEmision', 'total', 'moneda'],
        },
        },
    });
    bruto = response.text;
    } catch (e) {
        this.logger.error('Falló la llamada a Gemini', (e as Error).stack);
            throw new BadGatewayException('El servicio de extracción no está disponible. Inténtalo de nuevo.');
    }

    if (!bruto) throw new UnprocessableEntityException('El modelo no devolvió contenido.');

    let json: unknown;
    try {
    json = JSON.parse(bruto);
    } catch {
    throw new UnprocessableEntityException('La respuesta del modelo no es un JSON válido.');
    }

    const r = DatosFacturaSchema.safeParse(json);
    if (!r.success) {
        throw new UnprocessableEntityException(
        'No se pudieron extraer datos válidos de la factura: ' +
            r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        );
    }
    if (r.data.fechaLimitePago && r.data.fechaLimitePago < r.data.fechaEmision) {
        throw new UnprocessableEntityException('La fecha límite de pago es anterior a la de emisión.');
    }
    return { datos: r.data, bruto};

    
    }
}