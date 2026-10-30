export interface Proveedor {
    id: number;
    nombre: string;
}

export interface Documento {
    id: number;
    nombreArchivo: string;
    tipoMime: string;
    tamanoBytes: number;
    fechaCarga: string;
    respuestaLlm: string;
}

export interface Factura {
    id: number;
    numeroFactura: string;
    fechaEmision: string;
    total: number;
    moneda: string;
    fechaLimitePago: string | null;
    numeroCliente: string | null;
    proveedor: Proveedor;
    documento?: Documento;
}

export interface Paginado<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface FiltrosFacturas {
    page: number;
    pageSize: number;
    proveedor?: string;
    desde?: string;
    hasta?: string;
}

export interface ActualizarFactura {
    proveedor: string;
    numeroFactura: string;
    fechaEmision: string;
    total: number;
    moneda: string;
    fechaLimitePago?: string | null;
    numeroCliente?: string | null;
}

export interface ResumenFactura {
    proveedor: string;
    mes: string;
    moneda: string;
    totalFacturado: number;
    cantidadFacturas: number;
}

export interface ProblemDetails {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    errors?: string[];
}