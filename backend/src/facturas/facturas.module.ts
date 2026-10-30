import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Factura } from "./factura.entity";
import { Proveedor } from "../proveedores/proveedor.entity";
import { Documento } from "../documentos/documento.entity";
import { FacturasController } from "./facturas.controller";
import { FacturasService } from "./facturas.service";
import { GeminiModule } from "../gemini/gemini.module";
@Module({
    imports: [ TypeOrmModule.forFeature([Factura, Proveedor, Documento]), GeminiModule,],
    controllers: [FacturasController],
    providers: [FacturasService],
})
export class FacturasModule {}