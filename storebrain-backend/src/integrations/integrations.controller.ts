import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { CreateIntegrationPolicyHandler } from './policies/create-integration.policy';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies()
  async getIntegrations() {
    return await this.integrationsService.getIntegrations();
  }

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateIntegrationPolicyHandler())
  async createIntegrations(@Body() dto: CreateIntegrationDto) {
    console.log(dto);
    await this.integrationsService.createIntegration(dto);
    return HttpStatus.OK;
  }
}
