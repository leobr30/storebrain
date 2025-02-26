import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [PrismaModule, JobsModule, CaslModule],
  providers: [
    IntegrationsService,        
  ],
  controllers: [IntegrationsController],
  exports:[IntegrationsService]
})
export class IntegrationsModule {}
