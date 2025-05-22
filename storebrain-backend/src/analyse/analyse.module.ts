import { Module } from '@nestjs/common';
import { AnalyseController } from './analyse.controller';
import { AnalyseService } from './analyse.service';
import { OnerpModule } from '../onerp/onerp.module';
import { AnalyseGateway } from './analyse.gateway';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Module({
  imports: [OnerpModule],
  controllers: [AnalyseController],
  providers: [AnalyseService, AnalyseGateway, CaslAbilityFactory],
})
export class AnalyseModule {}
