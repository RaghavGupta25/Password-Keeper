import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { signInDto } from './dto/signIn.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async singUp(user: signInDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: user.email },
    });

    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Master Password does not match');
    }
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    user.password = await bcrypt.hash(user.password, 10);

    const newUser = await this.prisma.users.create({
      data: user,
    });
    const token = await this.jwtService.signAsync(
      {},
      { jwtid: uuidv4(), subject: newUser.id },
    );
    return { user: newUser, token };
  }

  async signIn(credentials: signInDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: credentials.email },
    });
    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!user || !passwordMatch) {
      throw new UnauthorizedException('user not found or incorrect password');
    }
    const token = await this.jwtService.signAsync(
      {},
      { jwtid: uuidv4(), subject: user.id },
    );
    return { user, token };
  }

}
