import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailStoreShipment } from './mail.interfaces';
import { Prisma, Training } from '@prisma/client';
import { userInfo } from 'os';
import { formatDate } from 'date-fns';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {


  private transporter: nodemailer.Transporter;
  constructor(private mailerService: MailerService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      }
    });
  }

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

  async sendMondayAppointmentMail(to: string, pdfBuffer: Buffer, date: Date) {
    await this.transporter.sendMail({
      from: `"Diamantor" <${process.env.EMAIL_ID}>`,
      to,
      subject: `Résumé du rendez-vous du lundi ${date.toLocaleDateString('fr-FR')}`,
      text: 'Vous trouverez en pièce jointe le résumé du rendez-vous du lundi.',
      attachments: [
        {
          filename: 'rdv-lundi.pdf',
          content: pdfBuffer,
        },
      ],
    });
  }


  async sendEmployeeFormMail(
    email: string,
    file: { fileName: string; mimeType: string; filePath: string },
    formTitle: string,
    userId: string,
    lastName: string,
    firstName: string,
    username: string, // ✅ Add username parameter
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `📄 Formulaire rempli : ${formTitle}`,
      template: './employee-form',
      context: {
        firstName,
        lastName,
        userId,
        formTitle,
        username, // ✅ Pass username to the template context
      },
      attachments: [
        {
          filename: file.fileName,
          path: file.filePath,
          contentType: file.mimeType,
        },
      ],
    });

    console.log(`📧 E-mail envoyé avec succès à ${email} avec le PDF en pièce jointe.`);
  }
}
