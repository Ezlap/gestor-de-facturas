import { z } from 'zod';

const esFechaReal = (s: string) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(esFechaReal, 'Fecha inexistente');

export const DatosFacturaSchema = z.object({
    proveedor: z.string().trim().min(1).max(200),
    numeroFactura: z.string().trim().min(1).max(100),
    fechaEmision: fecha,
    total: z.number().positive(),
    moneda: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
    fechaLimitePago: fecha.nullable().optional(),
    numeroCliente: z.string().trim().max(100).nullable().optional(),
});
export type DatosFactura = z.infer<typeof DatosFacturaSchema>;