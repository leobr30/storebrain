import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

import { EmployeeCreatedListener } from './listeners/employee-created.listener';

import { AbsenceUpdatedListener } from './listeners/absence-updated.listener';
import { PdfModule } from 'src/pdf/pdf.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { OnerpModule } from 'src/onerp/onerp.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { CaslModule } from 'src/casl/casl.module';
import { MailModule } from 'src/mail/mail.module';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { EmployeesTrainingClosedListener } from './listeners/employees-training-closed.listener';

@Module({
  imports: [PdfModule, PrismaModule,JobsModule, CompaniesModule, OnerpModule, IntegrationsModule, CaslModule, MailModule],
  controllers: [EmployeesController, TrainingsController],
  providers: [
    EmployeesService,
    TrainingsService,
    EmployeeCreatedListener,
    AbsenceUpdatedListener,
    EmployeesTrainingClosedListener,
  ],  
  exports: [EmployeesService]
})
export class EmployeesModule {}
