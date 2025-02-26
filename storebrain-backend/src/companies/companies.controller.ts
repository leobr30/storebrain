import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { ReadCompaniesPolicyHandler } from './policies/read-companies-policy';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadCompaniesPolicyHandler())
  async readCompanies() {
    return await this.companiesService.getCompanies();
  }
}
