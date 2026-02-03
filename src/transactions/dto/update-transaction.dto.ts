import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { TransactionContentsDto } from "./create-transaction.dto";

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber({}, { message: 'Total no válido' })
  total?: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Los Contenidos no pueden ir vacíos' })
  @ValidateNested()
  @Type(() => TransactionContentsDto)
  contents: TransactionContentsDto[];
}
