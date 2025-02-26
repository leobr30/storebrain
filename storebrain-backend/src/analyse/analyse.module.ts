import { Module } from '@nestjs/common';
import { AnalyseController } from './analyse.controller';
import { AnalyseService } from './analyse.service';
import { OnerpService } from 'src/onerp/onerp.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Module({
  controllers: [AnalyseController],
  providers: [AnalyseService, OnerpService, CaslAbilityFactory],
})
export class AnalyseModule {}
