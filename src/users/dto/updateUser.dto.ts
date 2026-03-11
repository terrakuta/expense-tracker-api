import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateUserDto {
  @IsOptional()
  @IsString({ message: 'Username should be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsOptional()
  @IsString({ message: 'Email should be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is incorrect. Re-check, please.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
