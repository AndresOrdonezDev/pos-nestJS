import { IsNotEmpty} from "class-validator"
export class CreateCategoryDto {
    @IsNotEmpty({message:"El nombre de la categoría es obligatorio"})
    name:string
}
