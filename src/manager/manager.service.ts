import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { loginInfoDto } from 'src/manager/dto/loginInfo.dto';
import { JwtPayload } from 'src/contracts/jwt-payload/jwt-payload.interface';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}
  async createLogin(loginInfo: loginInfoDto, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const encryptedPassword: string = await this.encryptData(
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

  async createCard(loginInfo: loginInfoDto, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const encryptedCardNumber: number = await this.encryptCardData(
      loginInfo.cardNumber,
    );
    const encryptedCvv: number = await this.encryptCardData(loginInfo.cvv);
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
    loginInfo: loginInfoDto,
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
      const encryptedPassword = await this.encryptData(loginInfo.password);
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
    loginInfo: loginInfoDto,
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
      updateData.cardNumber = await this.encryptCardData(loginInfo.cardNumber);
    } else {
      updateData.cardNumber = cardExist.cardNumber;
    }
    if (loginInfo.cvv) {
      updateData.cvv = await this.encryptCardData(loginInfo.cvv);
    } else {
      updateData.cvv = cardExist.cvv;
    }

    const updatedCard = await this.prisma.cards.update({
      where: { id },
      data: updateData,
    });

    return updatedCard;
  }

  async deleteLogin(id: string, user: JwtPayload): Promise<void> {
    const userId = user.sub;
    const login = await this.prisma.passwords.findUnique({ where: { id } });
    if (!login) throw new NotFoundException();
    if (login.userId !== userId)
      throw new UnauthorizedException(
        'you are not allowed to delete this as it does not belong to you',
      );
    await this.prisma.passwords.delete({ where: { id } });
  }

  async deleteCard(id: string, user: JwtPayload): Promise<void> {
    const userId = user.sub;
    const card = await this.prisma.cards.findUnique({ where: { id } });
    if (!card) throw new NotFoundException();
    if (card.userId !== userId)
      throw new UnauthorizedException(
        'you are not allowed to delete this as it does not belong to you',
      );
    await this.prisma.cards.delete({ where: { id } });
  }

  async getLoginByName(website: string, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const info = await this.prisma.passwords.findMany({
      where: { userId, website },
    });
    for (const entry of info) {
      entry.password = await this.decryptData(entry.password);
    }
    if (!info || info.length === 0) {
      throw new NotFoundException('No Entries');
    }
    return info;
  }

  async getCardByName(bank: string, user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const cards = await this.prisma.cards.findMany({ where: { userId, bank } });
    for (const card of cards) {
      card.cardNumber = await this.decryptCardData(card.cardNumber);
    }
    for (const card of cards) {
      card.cvv = await this.decryptCardData(card.cvv);
    }
    if (!cards || cards.length === 0) {
      throw new NotFoundException('No Entries');
    }
    return cards;
  }

  async getAllLogins(user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const logins = await this.prisma.passwords.findMany({ where: { userId } });
    for (const entry of logins) {
      entry.password = await this.decryptData(entry.password);
    }
    if (!logins || logins.length === 0) {
      throw new NotFoundException('No Entries');
    }
    return logins;
  }

  async getAllCards(user: JwtPayload): Promise<any> {
    const userId = user.sub;
    const cards = await this.prisma.cards.findMany({ where: { userId } });
    for (const card of cards) {
      card.cardNumber = await this.decryptCardData(card.cardNumber);
    }
    for (const card of cards) {
      card.cvv = await this.decryptCardData(card.cvv);
    }
    if (!cards || cards.length === 0) {
      throw new NotFoundException('No Entries');
    }
    return cards;
  }

  async encryptData(field: string | number): Promise<string> {
    const iv = randomBytes(16);
    const key = process.env.ENCRYPTION_KEY;
    const dataBuffer = Buffer.from(String(field), 'utf-8');
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedData = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final(),
    ]);
    const output = Buffer.concat([iv, encryptedData]);
    return output.toString('hex');
  }
  async encryptCardData(field: number): Promise<number> {
    const iv = randomBytes(16);
    const key = process.env.ENCRYPTION_KEY;
    const dataBuffer = Buffer.allocUnsafe(4);
    dataBuffer.writeUint32BE(field, 0);
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedData = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final(),
    ]);
    const output = Buffer.concat([iv, encryptedData]);
    return output.readUInt32BE();
  }

  async decryptData(field: string): Promise<string> {
    const encryptedBuffer = Buffer.from(field, 'hex');
    const iv = Buffer.alloc(16);
    const key = process.env.ENCRYPTION_KEY;
    const encryptedData = Buffer.alloc(encryptedBuffer.length - 16);

    encryptedBuffer.copy(iv, 0, 0, 16);
    encryptedBuffer.copy(encryptedData, 0, 16);

    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    let decryptedDataBuffer = decipher.update(encryptedData);
    decryptedDataBuffer = Buffer.concat([
      decryptedDataBuffer,
      decipher.final(),
    ]);

    return decryptedDataBuffer.toString('utf-8');
  }

  async decryptCardData(encryptedField: number): Promise<number> {
    const encryptedBuffer = Buffer.allocUnsafe(4);
    encryptedBuffer.writeUInt32BE(encryptedField, 0);
  
    // Manually extract the IV and encrypted data buffers
    const iv = Buffer.allocUnsafe(16);
    const encryptedData = Buffer.allocUnsafe(encryptedBuffer.length - 16);
  
    encryptedBuffer.copy(iv, 0, 0, 16);
    encryptedBuffer.copy(encryptedData, 0, 16);
  
    const key = process.env.ENCRYPTION_KEY;
  
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
  
    let decryptedDataBuffer = decipher.update(encryptedData);
    decryptedDataBuffer = Buffer.concat([decryptedDataBuffer, decipher.final()]);
  
    const originalNumber = decryptedDataBuffer.readUInt32BE();
  
    return originalNumber;
  }
  
}
