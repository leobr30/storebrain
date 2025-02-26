import { Injectable } from '@nestjs/common';
import { JobsService } from 'src/jobs/jobs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { JobNotFoundException } from 'src/employees/employees.errors';

@Injectable()
export class IntegrationsService {
  constructor(
    private prismaService: PrismaService,
    private jobsService: JobsService,
  ) {}

  async getIntegrations() {
    return await this.prismaService.jobOnboarding.findMany({
      include: {
        job: { select: { name: true } },
        jobOnboardingSteps: {
          include: {
            trainingModel: true,
          },
        },
      },
    });
  }
  async createIntegration(dto: CreateIntegrationDto) {
    const job = await this.jobsService.getJobById(dto.jobId);
    if (job === null) throw new JobNotFoundException();

    await this.prismaService.jobOnboarding.create({
      data: {
        jobId: job.id,
        jobOnboardingSteps: {
          create: dto.steps.map((step) => ({
            day: step.day,
            type: 'TRAINING'                      
          })),
        },
      },
    });
  }

  async getIntegration(id: number) {
    return await this.prismaService.jobOnboarding.findUnique({
      where: {
        jobId: id,
      },
      include: {
        jobOnboardingSteps:{
          include:{
            trainingModel: true,
            jobOnboardingResultReview: true
          }
        },
      },
    });
  }
}
