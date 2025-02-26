import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailStoreShipment } from './mail.interfaces';
import { Prisma, Training } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmployeeCreatedMail(
    files: { fileName: string; mimeType: string; filePath: string }[],
    subject: string,
  ) {
    console.log('Send mail');
    await this.mailerService.sendMail({
      to: 'leo.rigal@diamantor.Fr',
      subject,
      template: './user-created',
      attachments: files.map((file) => ({
        filename: file.fileName,
        path: file.filePath,
      })),
    });
  }

  async sendStoreShipmentAlertMail(magasin: number, storeShipments: MailStoreShipment[]) {
    await this.mailerService.sendMail({
      to: 'leo.rigal@diamantor.Fr',
      //cc: ['stephane.rigal@diamantor.fr','sandrine.teule@diamantor.fr'],
      subject: `Livraisons non posées M${magasin}`,
      template: './store-shipment-alert',
      context: { magasin, storeShipments, totalStoreShipments: storeShipments.length, totalQuantity: storeShipments.reduce((acc, curr) => acc + curr.quantity, 0) },
    });
  }

  async sendTrainingMail(realizedBy: string, subject: string, file: { fileName: string; mimeType: string; filePath: string }) {
    await this.mailerService.sendMail({
      to: 'leo.rigal@diamantor.Fr',
      subject,
      template: './training-validate',
      context: { realizedBy },
      attachments: [
        {
          filename: file.fileName,
          path: file.filePath,
        }
      ],
    });
  }
}
