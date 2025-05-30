import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { SubmitQuizzAnswersDto } from './dto/submit-quizz-answers.dto';
import { JobOnboardingStepType, Status, QuizzAnswer } from '@prisma/client';

@Injectable()
export class QuizzService {
  constructor(private prisma: PrismaService) { }

  async createQuizz(data: CreateQuizzDto) {
    console.log("📥 Requête reçue dans le controller /quizz POST");
    console.log("🧾 Données reçues :", data);

    return this.prisma.$transaction(async (prisma) => {


      // 1. Création du quizz avec sections et questions (sans les réponses)
      const quizz = await prisma.quizz.create({
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
                })),
              },
            })),
          },
        },
        include: {
          sections: {
            include: {
              questions: {},
            },
          },
        },
      });

      // 2. Vérifie que l'onboarding existe
      const onboarding = await prisma.jobOnboarding.findUnique({
        where: { id: data.jobOnboardingId },
      });

      if (!onboarding) {
        throw new NotFoundException(`Aucun JobOnboarding avec l'id ${data.jobOnboardingId}`);
      }

      const existingStep = await prisma.userJobOnboarding.findFirst({
        where: {
          userId: data.employeeId,
          jobOnboardingStep: {
            type: 'QUIZZ',
            jobOnboardingId: data.jobOnboardingId,
          },
        },
        include: {
          jobOnboardingStep: true,
        },
      });


      let onboardingStep;

      if (existingStep) {
        // On met à jour le quizz associé à l'étape existante
        onboardingStep = await prisma.jobOnboardingStep.update({
          where: { id: existingStep.jobOnboardingStep.id },
          data: {
            jobOnboardingQuizzId: quizz.id,
          },
        });

        // On met à jour l'étape utilisateur existante
        await prisma.userJobOnboarding.update({
          where: { id: existingStep.id },
          data: {
            date: new Date(),
            appointmentNumber: 0,
            status: 'PENDING',
          },
        });
      } else {
        // Sinon on crée l'étape + userJobOnboarding
        onboardingStep = await prisma.jobOnboardingStep.create({
          data: {
            type: 'QUIZZ',
            jobOnboardingId: data.jobOnboardingId,
            jobOnboardingQuizzId: quizz.id,
            day: 1,
            month: 0,
          },
        });

        await prisma.userJobOnboarding.create({
          data: {
            userId: data.employeeId,
            jobOnboardingStepId: onboardingStep.id,
            date: new Date(),
            appointmentNumber: 0,
            status: 'PENDING',
          },
        });
      }
    });
  }






  async getQuizzForOnboarding(quizzId: number) {
    const quizz = await this.prisma.quizz.findUnique({
      where: { id: quizzId },
      include: {
        sections: {
          include: {
            questions: {},
          },
        },
      },
    });

    if (!quizz) {
      throw new NotFoundException(`Quizz with ID ${quizzId} not found`);
    }

    return quizz;
  }


  async getQuizzById(id: number) {
    return this.prisma.quizz.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: {
            },
          },
        },
        assignedTo: true,
        createdBy: true,
      },
    });
  }

  async getQuizzes(userId: number, type: 'assigned' | 'created' | 'all' = 'all') {
    const whereClause =
      type === 'assigned'
        ? { assignedToId: userId }
        : type === 'created'
          ? { createdById: userId }
          : {};

    return this.prisma.quizz.findMany({
      where: whereClause,
      include: {
        createdBy: true,
        assignedTo: true,
        sections: {
          include: {
            questions: {},
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

    const createdAnswers = await this.prisma.quizzAnswer.createMany({
      data: dto.answers.map((answer) => ({
        questionId: answer.questionId,
        userId: dto.userId,
        text: answer.answer, // ✅ On ajoute text
      })),
    });

    const answers = await this.prisma.quizzAnswer.findMany({
      where: {
        question: {
          section: {
            quizzId,
          },
        },
        userId: dto.userId,
      },
      include: {
        question: true, // ✅ On inclut la question
      },
    });

    return {
      message: 'Réponses enregistrées ✅',
      count: createdAnswers.count,
      answers: answers, // ✅ On retourne les réponses
      quizzId: quizzId // ✅ On retourne le quizzId
    };
  }

  async getQuizzWithAnswers(quizzId: number, userId: string) {
    const quizz = await this.prisma.quizz.findUnique({
      where: { id: quizzId },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    const answers = await this.prisma.quizzAnswer.findMany({
      where: {
        question: {
          section: {
            quizzId,
          },
        },
        userId: Number(userId), // ✅ Convert userId to number
      },
      include: {
        question: true,
      },
    });

    return { quizz, answers };
  }



}
