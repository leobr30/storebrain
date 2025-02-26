import { Injectable } from '@nestjs/common';
import { CreateOrEditJobDto } from './dto/jobs.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { number } from 'yargs';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async getJobs() {
    return await this.prisma.job.findMany({
      include: {
        jobContracts: true,
      },
    });
  }

  async getJobById(id: number) {
    return await this.prisma.job.findUnique({
      where: {
        id,
      },
      include: { jobContracts: true },
    });
  }

  async createJob(dto: CreateOrEditJobDto) {
    const jobContracts = dto.contracts.map((contract) => ({
      type: contract.type,
      workingHoursPerWeek: contract.workingHoursPerWeek,
      lengthOfTrialPeriod: contract.lengthOfTrialPeriod,
    }));
    return await this.prisma.job.create({
      data: {
        name: dto.name,
        qualification: dto.qualification,
        jobContracts: {
          create: jobContracts,
        },
      },
    });
  }

  async updateJob(id: number, dto: CreateOrEditJobDto) {
    const jobContracts = dto.contracts.map((contract) => ({
      type: contract.type,
      workingHoursPerWeek: contract.workingHoursPerWeek,
      lengthOfTrialPeriod: contract.lengthOfTrialPeriod,
    }));
    return await this.prisma.job.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        qualification: dto.qualification,
        jobContracts: {
          create: jobContracts,
        },
      },
    });
  }
}
