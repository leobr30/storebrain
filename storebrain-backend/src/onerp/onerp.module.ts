import { Module } from '@nestjs/common';
import { OnerpService } from './onerp.service';
import { OnedocService } from 'src/onedoc/onedoc.service';

@Module({
  providers: [OnerpService, OnedocService],
  exports: [OnerpService, OnedocService]
})
export class OnerpModule {}
