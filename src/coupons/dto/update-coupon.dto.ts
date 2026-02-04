import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';
import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
    @IsNotEmpty({ message: "El nombre es obligatorio" })
    name: string

    @IsNotEmpty({ message: 'Ingrese el porcentaje de descuento' })
    @IsInt({ message: 'El porcentaje debe ser entre 1 y 100' })
    @Max(100, { message: 'El descuento máximo es 100' })
    @Min(1, { message: 'El descuento debe mínimo 1' })
    percentage: number

    @IsNotEmpty({ message: 'Ingrese la fecha de expiración' })
    @IsDateString({}, { message: 'Fecha no válida' })
    expirationDate: Date
}
