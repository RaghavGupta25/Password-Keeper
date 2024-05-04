import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { loginInfoDto } from './dto/loginInfo.dto';
import { JwtPayload } from 'src/contracts/jwt-payload/jwt-payload.interface';

@Controller('')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Request() req): Promise<any> {
    const user: JwtPayload = req.user;
    const passes = this.managerService.getAllLogins(user);
    const cards = this.managerService.getAllCards(user);
    return { passes, cards };
  }
  @UseGuards(AuthGuard)
  @Get('passwords')
  async getAllLogins(@Request() req): Promise<any> {
    const user: JwtPayload = req.user;
    return this.managerService.getAllLogins(user);
  }

  @UseGuards(AuthGuard)
  @Get('cards/:bank')
  async getLoginByName(
    @Body() loginInfo: loginInfoDto,
    @Request() req,
  ): Promise<any> {
    const user: JwtPayload = req.user;
    const website: string = loginInfo.website;
    return this.managerService.getCardByName(website, user);
  }
  @UseGuards(AuthGuard)
  @Get('cards')
  async getAllCards(@Request() req): Promise<any> {
    const user: JwtPayload = req.user;
    return this.managerService.getAllCards(user);
  }

  @UseGuards(AuthGuard)
  @Get('cards/:bank')
  async getCardByName(
    @Body() loginInfo: loginInfoDto,
    @Request() req,
  ): Promise<any> {
    const user: JwtPayload = req.user;
    const bank: string = loginInfo.bank;
    return this.managerService.getCardByName(bank, user);
  }

  @UseGuards(AuthGuard)
  @Post('add')
  async Create(@Body() loginInfo: loginInfoDto, @Request() req): Promise<any> {
    const user: JwtPayload = req.user;
    if (loginInfo.loginType === 'password') {
      return this.managerService.createLogin(loginInfo, user);
    } else if (loginInfo.loginType === 'card') {
      return this.managerService.createCard(loginInfo, user);
    }
  }
  @UseGuards(AuthGuard)
  @Patch('password/:id')
  async updateLogin(
    @Param('id') id: string,
    @Body() loginInfo: loginInfoDto,
    @Request() req,
  ): Promise<any> {
    const user: JwtPayload = req.user;
    return this.managerService.updateLogin(loginInfo, id, user);
  }

  @UseGuards(AuthGuard)
  @Patch('card/:id')
  async updateCardInfo(
    @Param('id') id: string,
    @Body() loginInfo: loginInfoDto,
    @Request() req,
  ): Promise<any> {
    const user: JwtPayload = req.user;
    return this.managerService.updateCardInfo(loginInfo, id, user);
  }

  @UseGuards(AuthGuard)
  @Delete('password/:id')
  async deleteLogin(@Request() req, @Param('id') id: string): Promise<any> {
    const user: JwtPayload = req.user;
    return this.managerService.deleteLogin(id, user);
  }

  @UseGuards(AuthGuard)
  @Delete('card/:id')
  async deleteCard(@Request() req, @Param('id') id: string): Promise<any> {
    const user: JwtPayload = req.user;
    return this.managerService.deleteCard(id, user);
  }
}
