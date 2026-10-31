import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_URL } from '../config';
import { ActualizarFactura, Factura, FiltrosFacturas, Paginado, ResumenFactura } from "../models/factura.model";

@Injectable({ providedIn: 'root' })
export class FacturasService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/facturas`;

listar(f: FiltrosFacturas) {
    let params = new HttpParams().set('page', f.page).set('pageSize', f.pageSize);
    if (f.proveedor) params = params.set('proveedor', f.proveedor);
    if (f.desde) params = params.set('desde', f.desde);
    if (f.hasta) params = params.set('hasta', f.hasta);
    return this.http.get<Paginado<Factura>>(this.base, { params });
}

    obtener(id: number) {
        return this.http.get<Factura>(`${this.base}/${id}`);
}

    actualizar(id: number, datos: ActualizarFactura) {
        return this.http.put<Factura>(`${this.base}/${id}`, datos);
}

    eliminar(id: number) {
        return this.http.delete<void>(`${this.base}/${id}`);
}

    resumen() {
        return this.http.get<ResumenFactura[]>(`${this.base}/reportes/resumen`);
}

    crear(archivo: File) {
        const form = new FormData();
        form.append('archivo', archivo);
        return this.http.post<Factura>(this.base, form, {
            reportProgress: true,
            observe: 'events',
        });
    }
}