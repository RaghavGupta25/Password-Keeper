import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginInfoDto } from 'src/manager/dto/loginInfo.dto';
import { JwtPayload } from 'src/contracts/jwt-payload/jwt-payload.interface';
import { encrypt } from './utils/encrypt';
import { decrypt } from './utils/decrypt';


@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}
  
  async createLogin(loginInfo: LoginInfoDto, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const encryptedPassword: string = await encrypt(
      loginInfo.password,
    );
    const newLogin = await this.prisma.passwords.create({
      data: {
        userId,
        username: loginInfo.username,
        password: encryptedPassword,
        website: loginInfo.website,
      },
    });

    return newLogin;
  }

  async createCard(loginInfo: LoginInfoDto, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const encryptedCardNumber: string = await encrypt(
      loginInfo.cardNumber,
    );
    const encryptedCvv: string = await encrypt(loginInfo.cvv);
    const newCard = await this.prisma.cards.create({
      data: {
        userId,
        cardNumber: encryptedCardNumber,
        cvv: encryptedCvv,
        cardHolder: loginInfo.cardHolder,
        expiry: loginInfo.expiry,
        bank: loginInfo.bank,
      },
    });
    return newCard;
  }

  async updateLogin(
    loginInfo: LoginInfoDto,
    id: string,
    user: JwtPayload,
  ): Promise<any> {
    const userId = user.sub;
    const loginExist = await this.prisma.passwords.findUnique({
      where: { id },
    });
    if (!loginExist)
      throw new NotFoundException('This login detail does not exist');

    if (loginExist.userId !== userId) {
      throw new UnauthorizedException(
        'This login detail does not belong for you',
      );
    }
    let updateData: any = {
      username: loginInfo.username ?? loginExist.username,
      website: loginInfo.website ?? loginExist.website,
    };

    if (loginInfo.password) {
      const encryptedPassword = await encrypt(loginInfo.password);
      updateData.password = encryptedPassword;
    } else {
      updateData.password = loginExist.password;
    }

    const updatedLogin = await this.prisma.passwords.update({
      where: { id },
      data: updateData,
    });

    return updatedLogin;
  }

  async updateCardInfo(
    loginInfo: LoginInfoDto,
    id: string,
    user: JwtPayload,
  ): Promise<any> {
    const userId = user.sub;
    const cardExist = await this.prisma.cards.findUnique({ where: { id } });

    if (!cardExist) throw new NotFoundException('Card details not found');

    if (cardExist.userId !== userId) {
      throw new UnauthorizedException('This card does not belong to you');
    }

    const updateData: any = {
      cardHolder: loginInfo.cardHolder ?? cardExist.cardHolder,
      expiry: loginInfo.expiry ?? cardExist.expiry,
      bank: loginInfo.bank ?? cardExist.bank,
    };

    if (loginInfo.cardNumber) {
      updateData.cardNumber = await encrypt(loginInfo.cardNumber);
    } else {
      updateData.cardNumber = cardExist.cardNumber;
    }
    if (loginInfo.cvv) {
      updateData.cvv = await encrypt(loginInfo.cvv);
    } else {
      updateData.cvv = cardExist.cvv;
    }

    const updatedCard = await this.prisma.cards.update({
      where: { id },
      data: updateData,
    });

    return updatedCard;
  }

  async deleteLogin(id: string, user: JwtPayload): Promise<string> {
    const userId = user.sub;
    const login = await this.prisma.passwords.findUnique({ where: { id } });
    if (!login) throw new NotFoundException();
    if (login.userId !== userId)
      throw new UnauthorizedException(
        'you are not allowed to delete this as it does not belong to you',
      );
    await this.prisma.passwords.delete({ where: { id } });
    return "Deleted the Login Details";
  }

  async deleteCard(id: string, user: JwtPayload): Promise<string> {
    const userId = user.sub;
    const card = await this.prisma.cards.findUnique({ where: { id } });
    if (!card) throw new NotFoundException();
    if (card.userId !== userId)
      throw new UnauthorizedException(
        'you are not allowed to delete this as it does not belong to you',
      );
    await this.prisma.cards.delete({ where: { id } });
    return "Deleted the Card Details";
  }

  async getLoginByName(website: string, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const info = await this.prisma.passwords.findMany({
      where: { userId, website },
    });
    for (const entry of info) {
      entry.password = await decrypt(entry.password);
    }
    if (!info || info.length === 0) {
      return 'No Entries';
    }
    return info;
  }

  async getCardByName(bank: string, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const cards = await this.prisma.cards.findMany({ where: { userId, bank } });
    for (const card of cards) {
      card.cardNumber = await decrypt(card.cardNumber);
    }
    for (const card of cards) {
      card.cvv = await decrypt(card.cvv);
    }
    if (!cards || cards.length === 0) {
      return 'No Entries';
    }
    return cards;
  }

  async getAllLogins(user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const logins = await this.prisma.passwords.findMany({ where: { userId } });
    for (const entry of logins) {
      entry.password = await decrypt(entry.password);
    }
    if (!logins || logins.length === 0) {
      return "No Entries";
    }
    return logins;
  }

  async getAllCards(user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const cards = await this.prisma.cards.findMany({ where: { userId } });
    for (const card of cards) {
      card.cardNumber = await decrypt(card.cardNumber);
    }
    for (const card of cards) {
      card.cvv = await decrypt(card.cvv.toString());
    }
    if (!cards || cards.length === 0) {
      return 'No Entries';
    }
    return cards;
  }
  
}
