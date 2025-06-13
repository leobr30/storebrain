// annual-reviews.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { AnnualReviewsService } from './annual-reviews.service';
import { CurrentUser } from 'src/decorators/user.decorator';
import { CurrentUserType } from 'src/auth/dto/current-user.dto';
import { PoliciesGuard } from 'src/casl/policy.guard';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { ReadEmployeesPolicyHandler, CreateEmployeesPolicyHandler } from '../employees/employees.policies';

@Controller('annual-reviews')
@UseGuards(PoliciesGuard)
export class AnnualReviewsController {
  constructor(private readonly annualReviewsService: AnnualReviewsService) { }

  @Get('sections')
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getSections() {
    return await this.annualReviewsService.getSections();
  }

  @Get()
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getReviews(
    @Query('employeeId') employeeId?: string,
    @Query('reviewerId') reviewerId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    const filters = {
      employeeId: employeeId ? parseInt(employeeId) : undefined,
      reviewerId: reviewerId ? parseInt(reviewerId) : undefined,
      companyId: companyId ? parseInt(companyId) : undefined,
      status: status,
    };

    return await this.annualReviewsService.getReviews(filters);
  }

  @Get(':id')
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getReview(@Param('id', ParseIntPipe) id: number) {
    return await this.annualReviewsService.getReview(id);
  }

  @Post()
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async createReview(
    @Body() dto: { employeeId: number; companyId: number },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.createReview({
      ...dto,
      reviewerId: currentUser.sub,
    });
  }

  @Put(':id')
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { responses: { questionId: number; answer: string }[] },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.updateReview(id, dto, currentUser);
  }

  @Post(':id/responses')
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async saveResponse(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() dto: { questionId: number; answer: string },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.saveResponse(reviewId, dto, currentUser);
  }

  @Post(':id/submit')
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async submitReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.submitReview(id, currentUser);
  }

  // ========== ADMIN ENDPOINTS ==========

  @Put('admin/sections')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async updateSections(
    @Body() dto: {
      sections: {
        id?: number;
        title: string;
        order: number;
        questions: {
          id?: number;
          question: string;
          type: string;
          options: string[];
          order: number;
          required: boolean;
        }[];
      }[];
    },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.updateSections(dto.sections, currentUser);
  }

  @Post('admin/sections')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async createSection(
    @Body() dto: { title: string; order: number },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.createSection(dto);
  }

  @Patch('admin/sections/:id')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { title?: string; order?: number },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.updateSection(id, dto);
  }

  @Delete('admin/sections/:id')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async deleteSection(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.deleteSection(id);
  }

  @Post('admin/sections/:sectionId/questions')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async createQuestion(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: {
      question: string;
      type: string;
      options: string[];
      order: number;
      required: boolean;
    },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.createQuestion(sectionId, dto);
  }

  @Patch('admin/questions/:id')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: {
      question?: string;
      type?: string;
      options?: string[];
      order?: number;
      required?: boolean;
    },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.updateQuestion(id, dto);
  }

  @Delete('admin/questions/:id')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.deleteQuestion(id);
  }

  @Post('admin/sections/reorder')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async reorderSections(
    @Body() dto: { sections: { id: number; order: number }[] },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.reorderSections(dto.sections);
  }

  @Post('admin/sections/:sectionId/questions/reorder')
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async reorderQuestions(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: { questions: { id: number; order: number }[] },
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.annualReviewsService.reorderQuestions(sectionId, dto.questions);
  }
}