import { Module } from '@nestjs/common';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';
import { OnerpService } from 'src/onerp/onerp.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [WebsiteController],
  providers: [WebsiteService, OnerpService, CaslAbilityFactory, PrismaService],
})
export class WebsiteModule {}
