import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuizzService } from './quizz.service';
import { QuizzController } from './quizz.controller';
import { EmployeesModule } from 'src/employees/employees.module';
import { MailModule } from 'src/mail/mail.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  imports: [PrismaModule, forwardRef(() => EmployeesModule), MailModule, PdfModule],
  providers: [QuizzService],
  controllers: [QuizzController],
  exports: [QuizzService],
})
export class QuizzModule {
  constructor() {
    console.log("✅ QuizzModule chargé !");
  }
}
