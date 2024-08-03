import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ManagerController],
  providers: [ManagerService],
  imports: [PrismaModule]
})
export class ManagerModule {}
