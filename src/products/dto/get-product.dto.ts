import { IsNumberString, IsOptional } from "class-validator";

export class GetProductQueryDto{
    @IsOptional()
    @IsNumberString({},{message:'Envíe la categoría como número'})
    category_Id:number

    @IsOptional()
    @IsNumberString({},{message:'La cantidad del limite debe ser un número'})
    take:number

    @IsOptional()
    @IsNumberString({},{message:'La cantidad de ignorados debe ser un número'})
    skip:number
}