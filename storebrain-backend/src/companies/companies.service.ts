import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}
  async getCompanies() {
    return await this.prisma.company.findMany();
  }

  async getCompanyById(id: number) {
    return await this.prisma.company.findUnique({
      where: {
        id,
      },
    });
  }
}
