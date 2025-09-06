import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateExpensesDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @IsNotEmpty({ message: 'Сумма не может быть пустой' })
  @IsPositive({ message: 'Сумма должна быть положительным числом' })
  @Min(0.01, { message: 'Сумма должна быть не менее 0.01' })
  @Max(1000000, { message: 'Сумма должна быть не больше 1000000' })
  amount: number;
}
