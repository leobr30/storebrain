import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { EmployeesService } from 'src/employees/employees.service'; // ✅ Import du service EmployeesService
import { ValidateOmarDto } from 'src/employees/dto/validate-omar.dto'; // ✅ Import du type ValidateOmarDto
import { CurrentUserType } from 'src/auth/dto/current-user.dto';

@Injectable()
export class FormsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
    private readonly employeesService: EmployeesService,
  ) { }

  async getResponseById(responseId: string) {
    try {
      const response = await this.prisma.employeeResponse.findUnique({
        where: { id: responseId },
        include: {
          form: {
            include: {
              sections: {
                include: {
                  items: true
                }
              }
            }
          },
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

  async saveFormToHistory(userId: number, formId: string, responses: any, comment?: string) {
    try {
      return await this.prisma.formHistory.create({
        data: {
          userId,
          formId,
          responses,
          comment,
        },
      });
    } catch (error) {
      console.error("❌ Erreur dans saveFormToHistory:", error);
      throw new HttpException('Error saving form history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async getHistoryByUser(userId: number) {
    try {
      console.log(`📜 Récupération de l'historique pour userId : ${userId}`);

      const history = await this.prisma.formHistory.findMany({
        where: { userId },
        include: { form: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!history || history.length === 0) {
        console.warn(`⚠️ Aucun historique trouvé pour userId: ${userId}`);
        return []; // ✅ Retourne un tableau vide au lieu d'une erreur
      }

      return history;
    } catch (error) {
      console.error("❌ Erreur dans getHistoryByUser :", error);
      throw new HttpException('Erreur lors de la récupération de l\'historique', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFormWithResponses(formId: string) {
    try {
      console.log(`📜 Récupération des données pour le formulaire ${formId}`);

      // 🔍 Rechercher le formulaire avec ses réponses
      const formWithResponses = await this.prisma.formHistory.findFirst({
        where: { formId },
        include: { form: true },
      });

      if (!formWithResponses) {
        console.warn(`⚠️ Aucun formulaire trouvé pour l'ID ${formId}`);
        return null;
      }

      console.log("✅ Données du formulaire récupérées :", formWithResponses);
      return formWithResponses;
    } catch (error) {
      console.error("❌ Erreur dans getFormWithResponses :", error);
      throw new HttpException("Erreur lors de la récupération du formulaire", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateOmar(id: number, dto: ValidateOmarDto, currentUser: CurrentUserType) { // ✅ Utilisation du type ValidateOmarDto et du type CurrentUserType
    return await this.employeesService.validateOmar(id, dto, currentUser); // ✅ Utilisation de la propriété employeesService
  }





}
