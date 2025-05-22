import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailStoreShipment } from './mail.interfaces';
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
      },
    });
  }

  async sendEmployeeCreatedMail(
    files: { fileName: string; mimeType: string; filePath: string }[],
    subject: string,
  ) {
    console.log('Envoi de l\'email de création d\'employé...');
    await this.mailerService.sendMail({
      to: 'leo.rigal@diamantor.Fr', // À modifier avec l'adresse de destination appropriée
      subject,
      template: './user-created', // Utilisation d'un template
      context: {
        // Tu peux ajouter des données contextuelles ici si nécessaire
        files: files.map((file) => ({
          filename: file.fileName,
          path: file.filePath,
        })),
      },
      attachments: files.map((file) => ({
        filename: file.fileName,
        path: file.filePath,
      })),
    });
    console.log('Email de création d\'employé envoyé avec succès.');
  }

  async sendStoreShipmentAlertMail(magasin: number, storeShipments: MailStoreShipment[]) {
    let cc = ['stephane.rigal@diamantor.fr','leo.rigal@diamantor.fr'];
    cc.push(magasin !== 116 ? 'sylvia.malfondet@diamantor.fr' : '');
    let to = '';
    if(magasin === 17) {
      to = 'responsables.nimes@diamantor.fr';
    } else if(magasin === 19) {
      to = 'responsables.narbonne@diamantor.fr';
    } else if(magasin === 20) {
      to = 'responsables.valence@diamantor.fr';
    } else if(magasin === 21) {
      to = 'responsables.avignon@diamantor.fr';
    } else if(magasin === 22) {
      to = 'responsables.mandelieu@diamantor.fr';
    } else if(magasin === 116) {
      to = 'sylvia.malfondet@diamantor.fr';
      
    }
    await this.mailerService.sendMail({
      to: to,
      cc: cc,
      subject: magasin === 116 ? `Livraisons non expediées SAS` : `Livraisons non posées M${magasin}`,
      template: './store-shipment-alert',
      context: { magasin, 
        storeShipments, 
        totalStoreShipments: storeShipments.length, 
        totalQuantity: storeShipments.reduce((acc, curr) => acc + curr.quantity, 0),
        message: magasin === 116 ? 'Ci-joint la liste des livraisons non expediées.' : 'Ci-joint la liste des livraisons non posées merci de les faire passer dans la GED ce jour.'
      },
    });
    console.log(`Email d'alerte de livraison pour le magasin M${magasin} envoyé avec succès.`);
  }

  async sendTrainingMail(
    realizedBy: string,
    subject: string,
    file: { fileName: string; mimeType: string; filePath: string },
  ) {
    console.log(`Envoi de l'email de validation de formation par ${realizedBy}...`);
    await this.mailerService.sendMail({
      to: 'gabriel.beduneau@diamantor.fr', // À modifier avec l'adresse de destination appropriée
      subject,
      template: './training-validate', // Utilisation d'un template
      context: { realizedBy, file },
      attachments: [
        {
          filename: file.fileName,
          path: file.filePath,
        },
      ],
    });
    console.log(`Email de validation de formation par ${realizedBy} envoyé avec succès.`);
  }

  async sendMondayAppointmentMail(
    to: string,
    pdfBuffer: Buffer,
    date: Date,
  ) {
    console.log(`Envoi de l'email de résumé du rendez-vous du lundi à ${to}...`);
    await this.mailerService.sendMail({ // Use mailerService here
      to,
      from: `"Diamantor" <${process.env.EMAIL_ID}>`,
      subject: `Résumé du rendez-vous du lundi ${date.toLocaleDateString(
        'fr-FR',
      )}`,
      template: './monday-appointment', // Utilisation d'un template
      context: {
        date: date.toLocaleDateString('fr-FR'),
        year: new Date().getFullYear(),
      },
      attachments: [
        {
          filename: 'rdv-lundi.pdf',
          content: pdfBuffer,
        },
      ],
    });
    console.log(`Email de résumé du rendez-vous du lundi envoyé avec succès à ${to}.`);
  }

  async sendEmployeeFormMail(
    email: string,
    file: { fileName: string; mimeType: string; filePath: string },
    formTitle: string,
    userId: string,
    lastName: string,
    firstName: string,
    username: string,
  ) {
    console.log(`Envoi de l'email de formulaire rempli à ${email}...`);
    await this.mailerService.sendMail({
      to: email,
      subject: `📄 Formulaire rempli : ${formTitle}`,
      template: './employee-form', // Utilisation d'un template
      context: {
        firstName,
        lastName,
        userId,
        formTitle,
        username,
        file,
        year: new Date().getFullYear(),
      },
      attachments: [
        {
          filename: file.fileName,
          path: file.filePath,
          contentType: file.mimeType,
        },
      ],
    });
    console.log(
      `Email de formulaire rempli envoyé avec succès à ${email} avec le PDF en pièce jointe.`,
    );
  }

  async sendQuizzResult(email: string, name: string, pdfBuffer: Buffer) {
    console.log(`Envoi de l'email de résultat de quizz à ${email}...`);
    await this.mailerService.sendMail({
      to: email, // Send to the employee's email
      subject: `Résultat du quizz`,
      template: './quizz-result', // Utilisation d'un template
      context: {
        name,
        year: new Date().getFullYear(),
      },
      attachments: [
        {
          filename: 'quizz.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log(`Email de résultat de quizz envoyé avec succès à ${email}.`);
  }

  async sendOmarResult(email: string, name: string, pdfBuffer: Buffer) {
    console.log('Envoie du mail !!!!!!!!!!!!!!!!!!!!')
    await this.mailerService.sendMail({
      to: email,
      subject: `Résultat OMAR de ${name}`,
      template: './omar-result',
      context: {
        name,
        year: new Date().getFullYear(),
      },
      attachments: [
        {
          filename: 'omar.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log(`Email omar envoyé à ${email}.`);
  }

  async sendMailWithAttachment({
    to,
    subject,
    text,
    attachments,
  }: {
    to: string;
    subject: string;
    text: string;
    attachments: { filename: string; content: Buffer }[];
  }) {
    console.log(`📤 Envoi d'un e-mail à ${to} avec pièce jointe...`);

    await this.mailerService.sendMail({
      to,
      from: `"Diamantor" <${process.env.EMAIL_ID}>`,
      subject,
      text,
      html: `<p>${text}</p>`,
      attachments,
    });

    console.log('✅ E-mail envoyé avec succès.');
  }



}