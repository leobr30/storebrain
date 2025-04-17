import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuizzService } from './quizz.service';
import { QuizzController } from './quizz.controller';

@Module({
  imports: [PrismaModule],
  providers: [QuizzService],
  controllers: [QuizzController],
  exports: [QuizzService],
})
export class QuizzModule {
  constructor() {
    console.log("✅ QuizzModule chargé !");
  }
}
