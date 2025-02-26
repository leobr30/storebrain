import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [PrismaModule,CaslModule],
  providers: [CompaniesService,],
  controllers: [CompaniesController],
  exports: [CompaniesService]
})
export class CompaniesModule {}
