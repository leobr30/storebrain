import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { ReadWebSiteProductsPolicyHandler } from './policies/read-website-products.policy';
import { WebsiteService } from './website.service';

// Définition du DTO pour la mise à jour du statut
class UpdateProductTrackingDto {
  hasPhotos: boolean;
  hasProductSheet: boolean;
}

@Controller('website')
export class WebsiteController {
  constructor(private websiteService: WebsiteService) {}
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadWebSiteProductsPolicyHandler())
  async geWebsiteProducts() {
    return await this.websiteService.getWebsiteProducts();
  }

  @Get('tracking')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadWebSiteProductsPolicyHandler())
  async getTracking() {
    return await this.websiteService.getTracking();
  }

  @Post('tracking/:produitId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadWebSiteProductsPolicyHandler())
  async updateProductTracking(
    @Param('produitId') produitId: string,
    @Body() updateDto: UpdateProductTrackingDto,
  ) {
    return await this.websiteService.updateProductTrackingStatus(
      parseInt(produitId, 10),
      updateDto.hasPhotos,
      updateDto.hasProductSheet,
    );
  }
}
