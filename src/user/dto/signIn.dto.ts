import { IsEmail, IsStrongPassword } from 'class-validator';
export class signInDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  confirmPassword: string;

  username: string;
}
