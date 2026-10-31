import { DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Factura } from '../../core/models/factura.model';
import { FacturasService } from '../../core/services/facturas.service';
import { NotificacionesService } from '../../core/services/notificacion.service';

const MAX_BYTES = 10 * 1024 * 1024;
const TIPOS = ['application/pdf', 'image/png', 'image/jpeg'];

@Component({
  selector: 'app-cargar',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cargar.html',
  styleUrl: './cargar.scss',
})
export class Cargar {
  private readonly api = inject(FacturasService);
  private readonly notificaciones = inject(NotificacionesService);

  readonly archivo = signal<File | null>(null);
  readonly vistaPrevia = signal<string | null>(null);
  readonly progreso = signal(0);
  readonly cargando = signal(false);
  readonly resultado = signal<Factura | null>(null);

  readonly fase = computed(() =>
    !this.cargando() ? 'inactivo' : this.progreso() < 100 ? 'subiendo' : 'analizando',
  );

  alSeleccionar(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.nueva();
    if (!file) return;

    if (!TIPOS.includes(file.type)) {
      this.notificaciones.error('Solo se aceptan archivos PDF, PNG o JPG.');
      input.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      this.notificaciones.error('El archivo supera el máximo de 10 MB.');
      input.value = '';
      return;
    }
    this.archivo.set(file);
    if (file.type.startsWith('image/')) this.vistaPrevia.set(URL.createObjectURL(file));
  }

  analizar() {
    const file = this.archivo();
    if (!file || this.cargando()) return;

    this.cargando.set(true);
    this.progreso.set(0);
    this.resultado.set(null);

    this.api.crear(file).subscribe({
      next: (evento) => {
        if (evento.type === HttpEventType.UploadProgress && evento.total) {
          this.progreso.set(Math.round((100 * evento.loaded) / evento.total));
        } else if (evento.type === HttpEventType.Response) {
          this.resultado.set(evento.body);
          this.cargando.set(false);
          this.notificaciones.ok('Factura analizada y guardada correctamente.');
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  nueva() {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.archivo.set(null);
    this.vistaPrevia.set(null);
    this.resultado.set(null);
    this.progreso.set(0);
  }
}
