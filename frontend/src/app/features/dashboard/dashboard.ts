import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ResumenFactura } from '../../core/models/factura.model';
import { FacturasService } from '../../core/services/facturas.service';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly api = inject(FacturasService);

  readonly cargando = signal(true);
  readonly totalFacturas = signal(0);
  readonly resumen = signal<ResumenFactura[]>([]);

  // Totales por moneda: nunca se suman monedas distintas
  readonly porMoneda = computed(() => {
    const mapa = new Map<string, { total: number; cantidad: number }>();
    for (const r of this.resumen()) {
      const acum = mapa.get(r.moneda) ?? { total: 0, cantidad: 0 };
      acum.total = Math.round((acum.total + r.totalFacturado) * 100) / 100;
      acum.cantidad += r.cantidadFacturas;
      mapa.set(r.moneda, acum);
    }
    return [...mapa.entries()].map(([moneda, v]) => ({ moneda, ...v }));
  });

  ngOnInit() {
    // Dos peticiones en paralelo; el total sale del campo `total` del listado paginado
    forkJoin({
      lista: this.api.listar({ page: 1, pageSize: 1 }),
      resumen: this.api.resumen(),
    }).subscribe({
      next: ({ lista, resumen }) => {
        this.totalFacturas.set(lista.total);
        this.resumen.set(resumen);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
