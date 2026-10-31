import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Factura, Paginado } from '../../../core/models/factura.model';
import { FacturasService } from '../../../core/services/facturas.service';
import { NotificacionesService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-facturas-lista',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './lista.html',
  styleUrl: './lista.scss',
})
export class Lista implements OnInit {
  private readonly api = inject(FacturasService);
  private readonly fb = inject(FormBuilder);
  private readonly notificaciones = inject(NotificacionesService);

  readonly filtros = this.fb.nonNullable.group({ proveedor: '', desde: '', hasta: '' });
  readonly pageSize = 10;

  readonly datos = signal<Paginado<Factura> | null>(null);
  readonly cargando = signal(false);
  readonly pagina = signal(1);
  readonly porEliminar = signal<Factura | null>(null);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    const { proveedor, desde, hasta } = this.filtros.getRawValue();
    this.api
      .listar({
        page: this.pagina(),
        pageSize: this.pageSize,
        proveedor: proveedor.trim() || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      })
      .subscribe({
        next: (r) => {
          this.datos.set(r);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  buscar() {
    this.pagina.set(1);
    this.cargar();
  }

  limpiar() {
    this.filtros.reset();
    this.buscar();
  }

  irA(p: number) {
    const total = this.datos()?.totalPages ?? 1;
    if (p < 1 || p > total) return;
    this.pagina.set(p);
    this.cargar();
  }

  pedirConfirmacion(f: Factura) {
    this.porEliminar.set(f);
  }

  cancelar() {
    this.porEliminar.set(null);
  }

  confirmarEliminar() {
    const f = this.porEliminar();
    if (!f) return;
    this.api.eliminar(f.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.notificaciones.ok(`Factura ${f.numeroFactura} eliminada.`);
        if (this.datos()?.items.length === 1 && this.pagina() > 1) {
          this.pagina.update((p) => p - 1);
        }
        this.cargar();
      },
      error: () => this.porEliminar.set(null),
    });
  }
}