import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from 'express';
import { QueryFailedError } from "typeorm";


const TITULOS: Record<number, string> = {
    400: 'Solicitud Invalida',
    404: 'Recurso no encontrado',
    409: 'Conflicto',
    413: 'Archivo demasiado grande',
    415: 'Tipo de archivo no soportado',
    422: 'No se pudo procesar el contenido',
    500: 'Error interno del servidor',
    502: 'Error del proveedor de IA',
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
    private readonly logger = new Logger(ProblemDetailsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let detail = 'Ocurrio un error inesperado.';
        let errors: unknown;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const body = exception.getResponse();
            if (typeof body === 'string') {
                detail = body;
            } else {
                const b = body as { message?: string | string[] };
                if (Array.isArray(b.message)) {
                    detail = 'La solicitud conitene datos invalidos.';
                    errors = b.message;
                } else if (b.message) {
                    detail = b.message;
                }
            }
        } else if (exception instanceof QueryFailedError) {
            const num = (exception as any).driverError?.number ?? (exception as any).number;
            if (num === 2601 || num === 2627) {
                status = HttpStatus.CONFLICT;
                detail = 'Ya existe un registro con esos datos (Duplicado).';
            } else {
                this.logger.error(exception.message, exception.stack);
            }
        } else {
            this.logger.error(String(exception), (exception as Error)?.stack);
        }

        res
        .status(status)
        .type('application/problem+json')
        .json({
            type: 'about:blank',
            title: TITULOS[status] ?? 'Error',
            status,
            detail,
            instance: req.url
            ...(errors ? { errors } : {}),
        });
    }
}