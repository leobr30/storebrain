import { Module } from '@nestjs/common';
import { ClosingDayController } from './closing-day.controller';
import { ClosingDayService } from './closing-day.service';
import { OnerpService } from '../onerp/onerp.service';
import { PrismaService } from '../prisma/prisma.service';
import { SavService } from '../sav/sav.service';
@Module({
  controllers: [ClosingDayController],
  providers: [ClosingDayService, OnerpService, PrismaService, SavService]
})
export class ClosingDayModule {}
