import { PayloadTooLargeException, UnsupportedMediaTypeException } from "@nestjs/common";


const MAX_BYTES = 10 * 1024 * 1024;

function detectarTipo(buf: Buffer): string | null {
    if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
    if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
    return null;
}

export function validarArchivo(file: Express.Multer.File): string {
    if (file.size > MAX_BYTES) throw new PayloadTooLargeException('El archivo supera el maximo de 10 MB.');
    const tipo = detectarTipo(file.buffer);
    if (!tipo) throw new UnsupportedMediaTypeException('Solo se aceptan archivos PDF, PNG o JPG.');
    return tipo;
}