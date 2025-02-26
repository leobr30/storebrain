import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnerpService } from 'src/onerp/onerp.service';
import { MailService } from 'src/mail/mail.service';
import { OnedocService } from 'src/onedoc/onedoc.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService, PrismaService, OnerpService, MailService, OnedocService  ],
})
export class AlertsModule {}
