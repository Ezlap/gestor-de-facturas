import { Transform } from "class-transformer";
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Matches, MaxLength } from "class-validator";

const recortar = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class ActualizarFacturaDto {
    @IsString() @IsNotEmpty() @MaxLength(200) @Transform(recortar)
    proveedor: string;

    @IsString() @IsNotEmpty() @MaxLength(100) @Transform(recortar)
    numeroFactura: string;

    @IsString() @IsNotEmpty() @IsISO8601({ strict: true}) @Matches(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'Fecha de Emision debe tener el formato YYYY-MM-DD' 
    })
    fechaEmision: string;

    @IsNumber({ maxDecimalPlaces: 2}) @IsPositive()
    total: number;

    @IsString() @IsNotEmpty() @Length(3, 3) @Matches(/^[A-Z]{3}$/, { 
    message: 'La moneda debe contener exactamente 3 letras mayúsculas (ej: COP, USD)' 
    })
    moneda: string;

    @IsOptional() @IsString() @IsISO8601({ strict: true}) @Matches(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'La Fecha Limite de Pago debe tener el formato YYYY-MM-DD' 
    })
    fechaLimitePago?: string | null;

    @IsOptional() @IsString() @MaxLength(100) @Transform(recortar)
    numeroCliente?: string | null;
}