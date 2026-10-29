import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Put, Query } from "@nestjs/common";
import { FacturasService } from "./facturas.service";
import { ListarFacturasDto } from "./dto/listar-facturas.dto";
import { ActualizarFacturaDto } from "./dto/actualizar-factura.dto";


@Controller('facturas')
export class FacturasController {
    constructor(private readonly service: FacturasService) {}

    @Get()
    listar(@Query() query: ListarFacturasDto) {
        return this.service.listar(query);
    }

    @Get('reportes/resumen')
    resumen() {
        return this.service.resumen();
    }

    @Get(':id')
    obtener(@Param('id', ParseIntPipe) id: number) {
        return this.service.obtener(id);
    }

    @Put(':id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ActualizarFacturaDto,
    ) {
        return this.service.actualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    async eliminar(@Param('id', ParseIntPipe) id: number) {
        await this.service.eliminar(id);
    }
}