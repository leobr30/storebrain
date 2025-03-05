import { Controller, Post, Body, Get, Param, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

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
