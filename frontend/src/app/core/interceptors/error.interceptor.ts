import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails } from '../models/factura.model';
import { NotificacionesService } from '../services/notificacion.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificaciones = inject(NotificacionesService);

return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
        const problema = err.error as Partial<ProblemDetails> | null;
        const texto =
        err.status === 0
            ? 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
            : problema?.detail ?? 'Ocurrió un error inesperado.';
        notificaciones.error(texto);
        return throwError(() => err);
        }),
    );
};