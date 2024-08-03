import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginInfoDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  cardNumber: string;

  @IsString()
  @IsOptional()
  cvv: string;

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
