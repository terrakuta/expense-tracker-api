import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExpensesDto {
  @IsString({ message: 'Description should be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber({}, { message: 'Description should be a number' })
  @IsNotEmpty({ message: 'Description is required' })
  amount: number;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsUUID()
  @IsOptional()
  categoryId: string;
}
