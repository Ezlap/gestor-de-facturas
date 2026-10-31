import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActualizarFactura, Factura } from '../../../core/models/factura.model';
import { FacturasService } from '../../../core/services/facturas.service';
import { NotificacionesService } from '../../../core/services/notificacion.service';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const fechaReal: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v || !FECHA.test(v)) return null; 
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? null : { fechaInexistente: true };
};

const maxDosDecimales: ValidatorFn = (c) => {
  const v = c.value;
  if (typeof v !== 'number') return null;
  return Math.round(v * 100) / 100 === v ? null : { decimales: true };
};

const fechaLimiteValida: ValidatorFn = (g) => {
  const e = (g.get('fechaEmision')?.value ?? '').trim();
  const l = (g.get('fechaLimitePago')?.value ?? '').trim();
  return FECHA.test(e) && FECHA.test(l) && l < e ? { fechaLimiteAnterior: true } : null;
};

@Component({
  selector: 'app-factura-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
})
export class Detalle implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(FacturasService);
  private readonly notificaciones = inject(NotificacionesService);

  readonly factura = signal<Factura | null>(null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly respuestaLlm = computed(() => {
    const bruto = this.factura()?.documento?.respuestaLlm;
    if (!bruto) return '';
    try {
      return JSON.stringify(JSON.parse(bruto), null, 2);
    } catch {
      return bruto;
    }
  });

  readonly form = this.fb.group(
    {
      proveedor: ['', [Validators.required, Validators.maxLength(200)]],
      numeroFactura: ['', [Validators.required, Validators.maxLength(100)]],
      fechaEmision: ['', [Validators.required, Validators.pattern(FECHA), fechaReal]],
      total: [null as number | null, [Validators.required, Validators.min(0.01), maxDosDecimales]],
      moneda: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]],
      fechaLimitePago: ['', [Validators.pattern(FECHA), fechaReal]],
      numeroCliente: ['', [Validators.maxLength(100)]],
    },
    { validators: fechaLimiteValida },
  );

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.router.navigate(['/facturas']);
      return;
    }
    this.cargando.set(true);
    this.api.obtener(id).subscribe({
      next: (f) => {
        this.rellenar(f);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.router.navigate(['/facturas']);
      },
    });
  }

  private rellenar(f: Factura) {
    this.factura.set(f);
    this.form.reset({
      proveedor: f.proveedor.nombre,
      numeroFactura: f.numeroFactura,
      fechaEmision: f.fechaEmision,
      total: f.total,
      moneda: f.moneda,
      fechaLimitePago: f.fechaLimitePago ?? '',
      numeroCliente: f.numeroCliente ?? '',
    });
  }

  guardar() {
    const f = this.factura();
    if (!f || this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: ActualizarFactura = {
      proveedor: (v.proveedor ?? '').trim(),
      numeroFactura: (v.numeroFactura ?? '').trim(),
      fechaEmision: (v.fechaEmision ?? '').trim(),
      total: Number(v.total),
      moneda: (v.moneda ?? '').trim().toUpperCase(),
      fechaLimitePago: v.fechaLimitePago?.trim() ? v.fechaLimitePago.trim() : null,
      numeroCliente: v.numeroCliente?.trim() ? v.numeroCliente.trim() : null,
    };

    this.guardando.set(true);
    this.api.actualizar(f.id, datos).subscribe({
      next: (actualizada) => {
        this.rellenar(actualizada);
        this.guardando.set(false);
        this.notificaciones.ok('Factura actualizada correctamente.');
      },
      error: () => this.guardando.set(false),
    });
  }

  mensaje(nombre: string): string | null {
    const c = this.form.get(nombre);
    if (!c || !(c.touched || c.dirty) || !c.errors) return null;
    if (c.errors['required']) return 'Este campo es obligatorio.';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['pattern']) return nombre === 'moneda' ? 'Debe tener 3 letras (por ejemplo, COP o USD).' : 'Usa el formato AAAA-MM-DD.';
    if (c.errors['fechaInexistente']) return 'Esa fecha no existe.';
    if (c.errors['min']) return 'Debe ser mayor que 0.';
    if (c.errors['decimales']) return 'Máximo 2 decimales.';
    return 'Valor no válido.';
  }
}