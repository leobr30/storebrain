import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { SubmitQuizzAnswersDto } from './dto/submit-quizz-answers.dto';
import { JobOnboardingStepType, Status } from '@prisma/client';

@Injectable()
export class QuizzService {
  constructor(private prisma: PrismaService) { }

  async createQuizz(data: CreateQuizzDto) {
    console.log("📥 Requête reçue dans le controller /quizz POST");
    console.log("🧾 Données reçues :", data);

    // 1. Création du quizz avec sections et questions (sans les réponses)
    const quizz = await this.prisma.quizz.create({
      data: {
        title: data.title,
        createdBy: { connect: { id: data.createdById } },
        assignedTo: { connect: { id: data.employeeId } },
        sections: {
          create: data.sections.map((section) => ({
            title: section.title,
            questions: {
              create: section.questions.map((question) => ({
                text: question.text,
                imageUrl: question.imageUrl,
                // ❌ Suppression de la création des réponses
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            questions: {
              // ❌ Suppression de l'inclusion des réponses
            },
          },
        },
      },
    });

    // 2. Vérifie que l'onboarding existe
    const onboarding = await this.prisma.jobOnboarding.findUnique({
      where: { id: data.jobOnboardingId },
    });

    if (!onboarding) {
      throw new NotFoundException(`Aucun JobOnboarding avec l'id ${data.jobOnboardingId}`);
    }

    // 3. Création d'une nouvelle étape QUIZZ dans l'onboarding
    const onboardingStep = await this.prisma.jobOnboardingStep.create({
      data: {
        type: 'QUIZZ',
        jobOnboardingId: data.jobOnboardingId,
        jobOnboardingQuizzId: quizz.id,
        day: 1,
        month: 0,
      },
    });

    // 4. Association de cette étape à l'utilisateur dans UserJobOnboarding
    await this.prisma.userJobOnboarding.create({
      data: {
        userId: data.employeeId,
        jobOnboardingStepId: onboardingStep.id,
        date: new Date(),
        appointmentNumber: 0,
        status: 'PENDING',
      },
    });

    console.log("✅ Quizz et étape QUIZZ créés et liés à l'utilisateur.");

    return quizz;
  }

  async getQuizzForOnboarding(quizzId: number) {
    return this.prisma.quizz.findUnique({
      where: { id: quizzId },
      select: {
        id: true,
        title: true,
      },
    });
  }

  async getQuizzById(id: number) {
    return this.prisma.quizz.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: {
              // ❌ Suppression de l'inclusion des réponses
            },
          },
        },
        assignedTo: true,
        createdBy: true,
      },
    });
  }

  async getQuizzByUser(userId: number) {
    return this.prisma.quizz.findMany({
      where: {
        assignedToId: userId,
      },
      include: {
        sections: {
          include: {
            questions: {
              // ❌ Suppression de l'inclusion des réponses
            },
          },
        },
      },
    });
  }

  async getQuizzCreatedBy(userId: number) {
    return this.prisma.quizz.findMany({
      where: { createdById: userId },
      include: {
        assignedTo: true,
        sections: {
          include: {
            questions: {
              // ❌ Suppression de l'inclusion des réponses
            },
          },
        },
      },
    });
  }

  async getQuizzAssignedTo(userId: number) {
    return this.prisma.quizz.findMany({
      where: { assignedToId: userId },
      include: {
        createdBy: true,
        sections: {
          include: {
            questions: {
              // ❌ Suppression de l'inclusion des réponses
            },
          },
        },
      },
    });
  }

  async deleteQuizz(id: number) {
    return this.prisma.quizz.delete({
      where: { id },
    });
  }

  async submitAnswers(quizzId: number, dto: SubmitQuizzAnswersDto) {
    await this.prisma.quizzAnswer.deleteMany({
      where: {
        question: {
          section: {
            quizzId,
          },
        },
        userId: dto.userId,
      },
    });

    const created = await this.prisma.quizzAnswer.createMany({
      data: dto.answers.map((answer) => ({
        questionId: answer.questionId,
        userId: dto.userId,
        text: answer.answer,
      })),
    });

    return {
      message: 'Réponses enregistrées ✅',
      count: created.count,
    };
  }
}
