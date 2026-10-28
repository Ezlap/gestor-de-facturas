import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Documento')
export class Documento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre_archivos', type: 'nvarchar', length: 255})
    nombreArchivo: string; 

    @Column({ name: 'tipo_mime', type: 'varchar', length: 50})
    tipoMime: string;

    @Column({ name: 'tamano_bytes', type: 'int' })
    tamanoBytes: number;

    @CreateDateColumn({ name: 'fecha_carga', type: 'datetime2'})
    fechaCarga: Date;

    @Column({ name: 'respuesta_llm', type: 'nvarchar', length: 'max'})
    respuestaLlm: string;
}