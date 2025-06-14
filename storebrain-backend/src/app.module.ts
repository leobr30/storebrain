import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OnerpModule } from './onerp/onerp.module';
import { AnalyseModule } from './analyse/analyse.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { EmployeesModule } from './employees/employees.module';
import { CaslModule } from './casl/casl.module';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from './mail/mail.module';
import { PdfModule } from './pdf/pdf.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { TrainingsModule } from './trainings/trainings.module';
import { WebsiteModule } from './website/website.module';
import { ToolsController } from './tools/tools.controller';
import { ToolsService } from './tools/tools.service';
import { ToolsModule } from './tools/tools.module';
import { AlertsModule } from './alerts/alerts.module';
import { ClosingDayModule } from './closing-day/closing-day.module';
import { SavService } from './sav/sav.service';
import { PrismaService } from './prisma/prisma.service';
import { FormsController } from './forms/forms.controller';
import { EmployeeResponsesController } from './forms/forms.controller';
import { FormsModule } from './forms/forms.module';
import { DocumentsModule } from './documents/documents.module';
import { QuizzModule } from './quizz/quizz.module';
import { YousignService } from './yousign/yousign.service';
import { ScheduleModule } from '@nestjs/schedule';
import { YousignModule } from './yousign/yousign.module';
import { AnnualReviewsModule } from './annual-review/annual-reviews.module';


@Module({
  imports: [
    YousignModule,
    ScheduleModule.forRoot(),
    QuizzModule,
    DocumentsModule,
    FormsModule,
    OnerpModule,
    AnalyseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    EmployeesModule,
    CaslModule,
    JobsModule,
    CompaniesModule,
    MailModule,
    PdfModule,
    IntegrationsModule,
    TrainingsModule,
    WebsiteModule,
    AlertsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
        },
      },
    }),
    ToolsModule,
    ClosingDayModule,
    AnnualReviewsModule,
  ],
  controllers: [FormsController, EmployeeResponsesController],
  providers: [SavService, PrismaService, YousignService],
  exports: [PrismaService, YousignService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

  }
}