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
