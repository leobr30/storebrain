
import { Module } from '@nestjs/common';
import { AnnualReviewsController } from './annual-reviews.controller';
import { AnnualReviewsService } from './annual-reviews.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [PrismaModule, CaslModule],
  controllers: [AnnualReviewsController],
  providers: [AnnualReviewsService],
  exports: [AnnualReviewsService],
})
export class AnnualReviewsModule {}