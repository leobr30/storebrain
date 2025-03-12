import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  UseGuards,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FormsService } from './forms.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

interface SaveEmployeeResponseDTO {
  userId: string;
  formId: string;
  responses: any;
  comment?: string;
}

interface CreateFormDTO {
  title: string;
  comment?: string;
  sections: {
    title: string;
    items: {
      label: string;
      selected?: boolean;
    }[];
  }[];
}

@Controller('forms')
export class FormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) { }


  @Get(':formId/download-pdf')
  async downloadPdf(@Param('formId') formId: string, @Res() res: Response) {
    try {
      console.log(`📥 Téléchargement du PDF pour formId: ${formId}`);

      // 🔍 Récupérer les données du formulaire
      const formData = await this.formsService.getFormWithResponses(formId);
      if (!formData) {
        throw new NotFoundException("Formulaire non trouvé.");
      }

      // 📄 Générer le PDF
      const pdfBuffer = await this.pdfService.generateEmployeeCreatedPdf(formData, `form_${formId}.pdf`);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new InternalServerErrorException("Erreur lors de la génération du PDF.");
      }

      // ✅ Envoie du fichier PDF
      res.set({
        'Content-Disposition': `attachment; filename="form_${formId}.pdf"`,
        'Content-Type': 'application/pdf',
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error("❌ Erreur dans downloadPdf:", error);
      throw new HttpException(error.message || 'Erreur interne', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Get('history/:userId')
  async getHistoryByUser(@Param('userId') userId: string) {
    const numericUserId = Number(userId);

    if (isNaN(numericUserId)) {
      console.error("❌ Erreur: userId invalide dans la requête :", userId);
      throw new BadRequestException('userId doit être un nombre valide.');
    }

    const history = await this.formsService.getHistoryByUser(numericUserId);
    return history;
  }

  @Post('history')
  async saveFormToHistory(
    @Body() { userId, formId, responses, comment }: { userId: number; formId: string; responses: any; comment?: string },
  ) {
    try {
      return this.formsService.saveFormToHistory(userId, formId, responses, comment);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':responseId')
  async getResponseById(@Param('responseId') responseId: string) {
    try {
      console.log(`🔍 Recherche de la réponse avec responseId: ${responseId}`);

      const response = await this.formsService.getResponseById(responseId);

      if (!response) {
        console.warn(`⚠️ Aucune réponse trouvée pour responseId: ${responseId}`);
        throw new NotFoundException('Aucune réponse trouvée.');
      }

      console.log("✅ Réponse trouvée :", response);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la réponse:', error);
      throw new InternalServerErrorException("Erreur serveur lors de la récupération de la réponse.");
    }
  }


  @Get('test-pdf')
  async testPdfGeneration() {
    try {
      console.log("🔍 Test de génération du PDF...");
      const pdfBuffer = await this.pdfService.generateEmployeeCreatedPdf({}, 'test-generated.pdf');
      console.log("✅ PDF généré avec succès !");
      return { message: 'Test PDF generated successfully' };
    } catch (error) {
      console.error("❌ Erreur lors de la génération du PDF:", error);
      throw new HttpException('Erreur de génération du PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post(':responseId/generate-pdf-email')
  async generatePdfAndSendEmail(@Param('responseId') responseId: string) {
    try {
      console.log(`📩 Début de la génération du PDF pour responseId: ${responseId}`);

      const response = await this.formsService.getResponseById(responseId);
      console.log("🔍 Données retournées par getResponseById :", response);

      if (!response) {
        console.error(`❌ Aucune réponse trouvée pour responseId: ${responseId}`);
        throw new NotFoundException('Response not found');
      }

      console.log("✅ Réponse trouvée, génération du PDF...");
      const pdfBuffer = await this.pdfService.generateEmployeeCreatedPdf(response, 'generated.pdf');

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error("❌ Échec de la génération du PDF");
        throw new HttpException('Error generating PDF', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.log("✅ PDF généré avec succès, envoi de l'email...");
      await this.mailService.sendEmployeeFormMail(
        'gabriel.beduneau@diamantor.fr',
        { fileName: 'formulaire.pdf', mimeType: 'application/pdf', filePath: 'generated.pdf' },
        response.form.title,
        response.userId.toString(),
        response.user.lastName.toString(),
        response.user.firstName
      );

      console.log("📩 Email envoyé avec succès !");
      return { message: 'PDF generated and email sent successfully' };

    } catch (error) {
      console.error("❌ Erreur dans generatePdfAndSendEmail:", error);
      throw new HttpException(error.message || 'Internal server error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Get()
  async getLatestForm() {
    try {
      console.log('📢 Tentative de récupération du formulaire...');

      const form = await this.prisma.form.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { sections: { include: { items: true } } },
      });

      if (!form) {
        console.warn('⚠️ Aucun formulaire trouvé.');
        throw new NotFoundException('Aucun formulaire trouvé.');
      }

      console.log('✅ Formulaire récupéré :', form);
      return form;
    } catch (error) {
      console.error('❌ ERREUR SERVER :', error);
      throw new InternalServerErrorException('Erreur lors de la récupération du formulaire.');
    }
  }

  @Post()
  async createForm(@Body() data: CreateFormDTO) {
    console.log('🔹 Données reçues pour la création du formulaire:', JSON.stringify(data, null, 2));

    if (!data.title || !data.sections || data.sections.length === 0) {
      console.error('❌ Erreur : Le titre et au moins une section sont requis.');
      throw new BadRequestException('Le titre et au moins une section sont requis.');
    }

    try {
      const form = await this.prisma.form.create({
        data: {
          title: data.title,
          comment: data.comment ?? '',
          sections: {
            create: data.sections.map((section: any) => ({
              title: section.title,
              items: {
                create: section.items.map((item: any) => ({
                  label: item.label,
                  selected: item.selected ?? false,
                })),
              },
            })),
          },
        },
        include: { sections: { include: { items: true } } },
      });

      console.log('✅ Formulaire créé avec succès:', form);
      return form;
    } catch (error) {
      console.error('❌ ERREUR SERVER :', error);
      throw new InternalServerErrorException("Erreur lors de l'enregistrement du formulaire");
    }
  }
}

@Controller('employee-responses')
export class EmployeeResponsesController {
  constructor(private readonly prisma: PrismaService) { }

  @Post()
  async saveEmployeeResponse(@Body() data: SaveEmployeeResponseDTO) {
    try {
      console.log('📢 Données reçues :', data);

      if (!data.userId || isNaN(Number(data.userId))) {
        throw new BadRequestException('userId est invalide.');
      }

      const userExists = await this.prisma.user.findUnique({
        where: { id: Number(data.userId) },
      });

      if (!userExists) {
        throw new BadRequestException("L'utilisateur spécifié n'existe pas.");
      }

      const response = await this.prisma.employeeResponse.create({
        data: {
          userId: Number(data.userId),
          formId: data.formId,
          responses: data.responses,
          comment: data.comment || '',
        },
      });

      console.log('✅ Réponses enregistrées avec succès :', response);
      return response;
    } catch (error) {
      console.error('❌ ERREUR SERVER :', error);
      throw new InternalServerErrorException("Erreur lors de l'enregistrement des réponses.");
    }
  }
}
