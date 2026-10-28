import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Proveedor')
export class Proveedor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "nvarchar", length: 200, unique: true})
    nombre: string;
}