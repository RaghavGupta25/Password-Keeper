import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, isNotEmpty } from 'class-validator';

export class loginInfoDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsInt()
  @IsOptional()
  cardNumber: number;

  @IsInt()
  @IsOptional()
  cvv: number;

  @IsString()
  @IsOptional()
  cardHolder: string;

  @IsString()
  @IsOptional()
  expiry: string;

  @IsString()
  @IsOptional()
  bank:string

  @IsString()
  @IsNotEmpty()
  @IsIn(['password', 'card'])
  loginType: 'password' | 'card';
}
