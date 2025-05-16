import { Module } from '@nestjs/common';
import { YousignService } from './yousign.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SignatureCheckService } from './signature-check.service';

@Module({
    imports: [PrismaModule],
    providers: [YousignService, SignatureCheckService],
    exports: [YousignService],
})
export class YousignModule { }
