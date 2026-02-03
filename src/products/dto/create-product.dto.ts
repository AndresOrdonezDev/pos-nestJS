import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { IsNull } from "typeorm"


export class CreateProductDto {
   @IsNotEmpty({message:'El nombre del producto es obligatorio'}) 
   @IsString({message:'Nombre no válido'})
   name:string
   
   @IsNotEmpty({message:'El precio es obligatorio'})
   @IsNumber({maxDecimalPlaces:2},{message:'Precio no válido'})
   price:number

   @IsNotEmpty({message:'Ingrese al menos 1'})
   @IsNumber({maxDecimalPlaces:0},{message:'Inventario no válido'})
   inventory:number

   @IsNotEmpty({message:'La categoría es obligatoria'})
   @IsInt({message:'Categoría no válida'})
   categoryId:number
}
