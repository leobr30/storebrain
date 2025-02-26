import { Controller, Get, UseGuards } from '@nestjs/common';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { ReadWebSiteProductsPolicyHandler } from './policies/read-website-products.policy';
import { WebsiteService } from './website.service';

@Controller('website')
export class WebsiteController {
  constructor(private websiteService: WebsiteService) {}
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadWebSiteProductsPolicyHandler())
  async geWebsiteProducts() {
    return await this.websiteService.getWebsiteProducts();
  }
}
