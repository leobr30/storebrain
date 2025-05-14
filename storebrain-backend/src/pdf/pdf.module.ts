import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service'
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { YousignModule } from 'src/yousign/yousign.module';


@Module({
  imports: [PrismaModule, MailModule, YousignModule],
  providers: [
    PdfService    
  ],  
  exports: [PdfService],
})
export class PdfModule {}
