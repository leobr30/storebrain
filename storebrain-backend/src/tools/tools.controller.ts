import {
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Delete,
  Param,
  Put,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { ToolsService } from './tools.service';
import { PriceUpdate, PriceUpdateRowArticle } from '@prisma/client';
import { CreateBalanceDto } from './dto/create-balance.dto';

@Controller('tools')
export class ToolsController {
  constructor(private toolsService: ToolsService) {}
  @Post('missing-size-for-order')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'upload/tmp',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  async missingSizeForOrder(@UploadedFile() file: Express.Multer.File) {
    this.toolsService.readMissingSizeForOrderCsv(file);

    return HttpStatus.OK;
  }

  @Post('update-prices')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'upload/tmp',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  async updatePrices(@UploadedFile() file: Express.Multer.File):Promise<PriceUpdate> {    
    return await this.toolsService.readPriceUpdateCsv(file);
  }

  @Get('last-price-update')
  async getLastPriceUpdate() {
    const priceUpdate = await this.toolsService.getLastPriceUpdate();
    return priceUpdate ?? null;
  }

  @Get('order-download/:id')
  async getOrderDownload(@Param('id') id: number) {
    await this.toolsService.getOrderDownload(id);
    return HttpStatus.OK;
  }

  @Delete('price-update-row-article/:id')
  async deletePriceUpdateRowArticle(@Param('id') id: number) {
    await this.toolsService.deletePriceUpdateRowArticle(id);
    return HttpStatus.OK;
  }

  @Put('price-update-row-article/:id')
  async updatePriceUpdateRowArticle(
    @Param('id') id: number,
    @Body() updateData: Partial<PriceUpdateRowArticle>
  ) {
    const updatedArticle = await this.toolsService.updatePriceUpdateRowArticle(id, updateData);
    return updatedArticle;
  }

  @Delete('price-update-row/:id')
  async deletePriceUpdateRow(@Param('id') id: number) {
    await this.toolsService.deletePriceUpdateRow(id);
    return HttpStatus.OK;
  }

  @Put('price-update-row/:id/status')
  async updatePriceUpdateRowStatus(
    @Param('id') id: number,    
  ) {
    const updatedRow = await this.toolsService.updatePriceUpdateRowStatus(id);
    return updatedRow;
    }

    @Post('balance')
    async createBalance(@Body() createBalanceDto: CreateBalanceDto) {
      return await this.toolsService.createBalance(createBalanceDto);
    }

    @Get('balance/last')
    async getLastBalance() {
      return await this.toolsService.getLastBalance();
    }

    @Delete('balance/row/:id')
    async deleteBalanceRow(@Param('id') id: number) {
      await this.toolsService.deleteBalanceRow(id);
      return HttpStatus.OK;
    }

    @Put('balance/row/:id')
    async updateBalanceRow(@Param('id') id: number, @Body() data: any) {
      return await this.toolsService.updateBalanceRow(id, data);
    }

    @Put('balance/row/:id/complete')
    async completeBalanceRow(@Param('id') id: number) {
      return await this.toolsService.completeBalanceRow(id);
    }

    @Get('balance/:id/download')
    async downloadBalance(@Param('id') id: number) {
      return await this.toolsService.downloadBalance(id);
    }

    @Post('onerp/:onerpType')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: memoryStorage()
      }),
    )
    async generateOnerp(@UploadedFile() file: Express.Multer.File, @Param('onerpType') onerpType: string) {
      return await this.toolsService.generateOnerp(onerpType,file);
    }
}
