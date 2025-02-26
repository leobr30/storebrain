import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CheckPolicies } from 'src/casl/policy.decorator';
import {
  CreateJobPolicyHandler,
  ReadJobPolicyHandler,
  UpdateJobPolicyHandler,
} from './jobs.policies';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { CreateOrEditJobDto } from './dto/jobs.dto';
import { JobsService } from './jobs.service';
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadJobPolicyHandler())
  async getJobs() {
    return await this.jobsService.getJobs();
  }

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateJobPolicyHandler())
  async createJob(@Body() dto: CreateOrEditJobDto) {
    return await this.jobsService.createJob(dto);
  }

  @Put(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateJobPolicyHandler())
  async updateJob(@Param('id') id: number, @Body() dto: CreateOrEditJobDto) {
    return await this.jobsService.updateJob(id, dto);
  }
}
