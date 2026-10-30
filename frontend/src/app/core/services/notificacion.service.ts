import { Injectable, signal } from '@angular/core';

export interface Notificacion {
    tipo: 'ok' | 'error';
    texto: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
    readonly mensaje = signal<Notificacion | null>(null);

    ok(texto: string) { this.mostrar({ tipo: 'ok', texto }); }
    error(texto: string) { this.mostrar({ tipo: 'error', texto }); }

    private mostrar(n: Notificacion) {
        this.mensaje.set(n);
        setTimeout(() => this.mensaje.set(null), 6000);
    }
}