import { Controller, Post, Body, Get, Param, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async getLatestForm() {
    try {
      console.log("📢 Tentative de récupération du formulaire...");

      const form = await this.prisma.form.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { sections: { include: { items: true } } },
      });

      if (!form) {
        console.warn("⚠️ Aucun formulaire trouvé.");
        throw new NotFoundException('Aucun formulaire trouvé.');
      }

      console.log("✅ Formulaire récupéré :", form);
      return form;
    } catch (error) {
      console.error("❌ ERREUR SERVER :", error);
      throw new InternalServerErrorException("Erreur lors de la récupération du formulaire.");
    }
  }

  @Post()
  async createForm(@Body() data: CreateFormDTO) {
    console.log("🔹 Données reçues pour la création du formulaire:", JSON.stringify(data, null, 2));

    if (!data.title || !data.sections || data.sections.length === 0) {
      console.error("❌ Erreur : Le titre et au moins une section sont requis.");
      throw new BadRequestException('Le titre et au moins une section sont requis.');
    }

    try {
      const form = await this.prisma.form.create({
        data: {
          title: data.title,
          comment: data.comment ?? "",
          sections: {
            create: data.sections.map((section) => ({
              title: section.title,
              items: {
                create: section.items.map((item) => ({
                  label: item.label,
                  selected: item.selected ?? false,
                })),
              },
            })),
          },
        },
        include: { sections: { include: { items: true } } },
      });

      console.log("✅ Formulaire créé avec succès:", form);
      return form;
    } catch (error) {
      console.error("❌ ERREUR SERVER :", error);
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
      console.log("📢 Données reçues :", data);


      if (!data.userId || isNaN(Number(data.userId))) {
        throw new BadRequestException("userId est invalide.");
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
          comment: data.comment || "",
        },
      });

      console.log("✅ Réponses enregistrées avec succès :", response);
      return response;
    } catch (error) {
      console.error("❌ ERREUR SERVER :", error);
      throw new InternalServerErrorException("Erreur lors de l'enregistrement des réponses.");
    }
  }


}

