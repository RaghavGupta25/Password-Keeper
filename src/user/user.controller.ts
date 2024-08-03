import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';

import { UserService } from './user.service';
import { SignInDto } from './dto/signIn.dto';
import { Request, Response } from 'express';
import { Users } from '@prisma/client';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(
    @Body() newUser: SignInDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { user, token }: { user: Partial<Users>; token: string } =
        await this.userService.singUp(newUser);

      delete user.password;
      delete user.confirmPassword;
      res.cookie('jwt', token, { httpOnly: true });

      res.status(201).send({ user: user });
    } catch (err: unknown) {
      throw new InternalServerErrorException(err);
    }
  }

  @Post('signin')
  async signIn(@Body() credentials: SignInDto, @Res() res: Response) {
    try {
      const { user, token }: { user: Partial<Users>; token: string } =
        await this.userService.signIn(credentials);

      delete user.password;
      delete user.confirmPassword;

      res.cookie('jwt', token, { httpOnly: true });

      res.status(200).send({ user: user });
    } catch (err: unknown) {
      throw new InternalServerErrorException(err);
    }
  }
}
