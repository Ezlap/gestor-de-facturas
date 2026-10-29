import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Factura } from "./factura.entity";
import { DataSource, Repository } from "typeorm";
import { ListarFacturasDto } from "./dto/listar-facturas.dto";
import { ActualizarFacturaDto } from "./dto/actualizar-factura.dto";
import { Proveedor } from "../proveedores/proveedor.entity";
import { ResumenFactura } from "./resumen-factura.interface";

@Injectable()
export class FacturasService {
    constructor(
        @InjectRepository(Factura) private readonly facturas: Repository<Factura>,
        private readonly dataSource: DataSource,
    ) {}

    async listar(q: ListarFacturasDto) {
        const qb = this.facturas
        .createQueryBuilder('f')
        .innerJoinAndSelect('f.proveedor', 'p')
        .where('f.eliminada = :elim', { elim: false});

    if (q.proveedor) qb.andWhere('p.nombre LIKE :prov', { prov: `%${q.proveedor}%`});
    if (q.desde) qb.andWhere('f.fechaEmision >= :desde', { desde: q.desde });
    if (q.hasta) qb.andWhere('f.fechaEmision <= :hasta', { hasta: q.hasta });

    qb.orderBy('f.fechaEmision', 'DESC')
        .addOrderBy('f.id', 'DESC')
        .skip((q.page - 1) * q.pageSize)
        .take(q.pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
        items,
        total,
        page: q.page,
        pageSize: q.pageSize,
        totalPages: Math.ceil(total / q.pageSize)
    };
}

async obtener(id: number) {
    const factura = await this.facturas.findOne({
        where: { id, eliminada: false },
        relations: { proveedor: true, documento: true },
    });
    if (!factura) throw new NotFoundException(`No existe la factura con id ${id}.`);
    return factura;
}

async actualizar(id: number, dto: ActualizarFacturaDto): Promise<Factura> {
    await this.dataSource.transaction(async (manager) => {
        const factura = await manager.findOne(Factura, {
        where: { id, eliminada: false },
    });
    if (!factura) {
        throw new NotFoundException(`No existe la factura con id ${id}.`);
    }

    if (dto.fechaLimitePago && dto.fechaLimitePago < dto.fechaEmision) {
        throw new UnprocessableEntityException(
            'La fecha límite de pago no puede ser anterior a la fecha de emisión.',
        );
    }

    let proveedor = await manager.findOne(Proveedor, {
        where: { nombre: dto.proveedor },
    });
    if (!proveedor) {
            proveedor = await manager.save(
                manager.create(Proveedor, { nombre: dto.proveedor }),
        );
    }

    factura.proveedor = proveedor;
    factura.numeroFactura = dto.numeroFactura;
    factura.fechaEmision = dto.fechaEmision;
    factura.total = dto.total;
    factura.moneda = dto.moneda;
    factura.fechaLimitePago = dto.fechaLimitePago ?? null;
    factura.numeroCliente = dto.numeroCliente ?? null;
    await manager.save(factura);
});

    return this.obtener(id);
}

async eliminar(id: number): Promise<void> {
    const factura = await this.obtener(id);
    factura.eliminada = true;
    await this.facturas.save(factura);
}

async resumen(): Promise<ResumenFactura[]> {
    return this.dataSource.query(`
        SELECT p.nombre AS proveedor,
        CONVERT(char(7), f.fecha_emision, 120) AS mes,
        f.moneda AS moneda,
        SUM(f.total) AS totalFacturado,
        COUNT(*) AS cantidadFacturas
        FROM Factura f
        INNER JOIN Proveedor p ON p.id = f.proveedor_id
        WHERE f.eliminada = 0
        GROUP BY p.nombre, CONVERT(char(7), f.fecha_emision, 120), f.moneda
        ORDER BY mes DESC, proveedor, moneda;
        `);
    } 
}