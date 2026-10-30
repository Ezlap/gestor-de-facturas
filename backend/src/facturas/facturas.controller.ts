import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import { FacturasService } from "./facturas.service";
import { ListarFacturasDto } from "./dto/listar-facturas.dto";
import { ActualizarFacturaDto } from "./dto/actualizar-factura.dto";
import { GeminiService } from "../gemini/gemini.service";


@Controller('facturas')
export class FacturasController {
    constructor(
        private readonly geminiService: GeminiService,
        private readonly service: FacturasService
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: 10 * 1024 * 1024 } }))
    crear(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Envia el archivo en el campo "archivo".');
        return this.service.crearDesdeArchivo(file);
}
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