import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListarFacturasDto {
    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    page: number = 1;

    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
    pageSize: number = 10;

    @IsOptional() @IsString()
    proveedor?: string;

    @IsOptional() @IsDateString()
    desde?: string;

    @IsOptional() @IsDateString()
    hasta?: string;
}