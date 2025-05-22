import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AnalyseService } from './analyse.service';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { ReadAnalyze1PolicyHandler } from './analyzes.policies';
import { Analyze1Dto } from './dto/analyze1.dto';
import { Response } from 'express';

@Controller('analyze')
export class AnalyseController {
  constructor(private readonly analyseService: AnalyseService) {}
  @Post('analyze1')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadAnalyze1PolicyHandler())
  async getAnalyze1(@Body() dto: Analyze1Dto) {
    return await this.analyseService.getAnalyze1(dto);
  }
}
