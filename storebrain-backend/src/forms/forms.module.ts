import { Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, EmployeesModule],
  controllers: [FormsController],
  providers: [FormsService, PdfService, MailService, PrismaService],
  exports: [FormsService],
})
export class FormsModule {}