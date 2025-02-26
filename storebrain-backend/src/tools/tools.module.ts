import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OnerpModule } from 'src/onerp/onerp.module';

@Module({
    controllers: [ToolsController],
    providers:[ ToolsService ],
    imports: [
        OnerpModule,
        PrismaModule
    ]
})
export class ToolsModule {

}
