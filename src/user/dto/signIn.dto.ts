import { IsEmail, IsStrongPassword } from 'class-validator';
export class SignInDto {
  @IsEmail()
  email: string;

  //@IsStrongPassword()
  password: string;

  confirmPassword: string;

  username: string;
}
