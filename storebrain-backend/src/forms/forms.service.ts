import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FormsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) { }

  async getResponseById(responseId: string) {
    try {
      const response = await this.prisma.employeeResponse.findUnique({
        where: { id: responseId },
        include: {
          form: true,
          user: true,
        },
      });

      if (!response) {
        throw new HttpException('Response not found', HttpStatus.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generatePdf(response: any) {
    try {
      return await this.pdfService.generateEmployeeCreatedPdf(response, 'generated.pdf'); // Corrected function
    } catch (error) {
      throw new HttpException('Error generating PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
}
