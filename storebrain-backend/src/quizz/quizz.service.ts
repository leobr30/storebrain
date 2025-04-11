import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { SubmitQuizzAnswersDto } from './dto/submit-quizz-answers.dto';
import { JobOnboardingStepType } from '@prisma/client';

@Injectable()
export class QuizzService {
  constructor(private prisma: PrismaService) { }

  async createQuizz(data: CreateQuizzDto) {
    const quizz = await this.prisma.quizz.create({
      data: {
        title: data.title,
        createdBy: { connect: { id: data.createdById } },
        assignedTo: { connect: { id: data.assignedToId } },
        sections: {
          create: data.sections.map((section) => ({
            title: section.title,
            questions: {
              create: section.questions.map((question) => ({
                text: question.text,
                imageUrl: question.imageUrl,
                answers: {
                  create: question.answers.map((answer) => ({
                    text: answer.text,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });

    
    await this.prisma.jobOnboardingStep.create({
      data: {
        type: JobOnboardingStepType.QUIZZ,
        jobOnboardingId: data.jobOnboardingId,
        jobOnboardingQuizzId: quizz.id,
        day: 1,
        month: 0,
      },
    });

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
              include: {
                answers: true,
              },
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
              include: {
                answers: true,
              },
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
              include: {
                answers: true,
              },
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
              include: {
                answers: true,
              },
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
