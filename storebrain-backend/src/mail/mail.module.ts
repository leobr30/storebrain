import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  providers: [MailService],
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT!),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_ID, // generated ethereal user
            pass: process.env.EMAIL_PASS, // generated ethereal password
          },
          pool: true,
        },
        defaults: {
          from: 'Diamantor no-reply@diamantor.fr>', // outgoing email ID
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  exports: [MailService]
})
export class MailModule { }