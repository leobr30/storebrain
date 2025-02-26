import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service'
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';


@Module({
  imports: [PrismaModule, MailModule],
  providers: [
    PdfService    
  ],  
  exports: [PdfService],
})
export class PdfModule {}
