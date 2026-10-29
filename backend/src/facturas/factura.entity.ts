import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Proveedor } from "../proveedores/proveedor.entity";
import { Documento } from "../documentos/documento.entity";

@Entity('Factura')
export class Factura {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Proveedor, { nullable: false})
    @JoinColumn({ name: 'proveedor_id' })
    proveedor: Proveedor;

    @OneToOne(() => Documento, { nullable: false})
    @JoinColumn({ name: 'documento_id' })
    documento: Documento;

    @Column({ name: 'numero_factura', type: 'nvarchar', length: 100})
    numeroFactura: string;

    @Column({ name: 'fecha_emision', type: 'date'})
    fechaEmision: string;

    @Column({ type: 'decimal', precision: 18, scale: 2})
    total: number;

    @Column({ type: 'char', length: 3})
    moneda: string; 

    @Column({ name: 'fecha_limite_pago', type: 'date', nullable: true })
    fechaLimitePago: string | null;

    @Column({ name: 'numero_cliente', type: 'nvarchar', length: 100, nullable: true})
    numeroCliente: string | null;
    
    @Column({ type: 'bit', default: false})
    eliminada: boolean;
}