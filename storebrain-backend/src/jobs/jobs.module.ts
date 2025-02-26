import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [PrismaModule,CaslModule],
  controllers: [JobsController],
  providers: [
    JobsService,    
  ],
  exports:[JobsService]
})
export class JobsModule {}
