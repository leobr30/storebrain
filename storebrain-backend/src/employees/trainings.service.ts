import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import path, { join } from "path";
import fs, { createReadStream } from 'fs';
import { CurrentUserType } from "src/auth/dto/current-user.dto";
import { Status } from "@prisma/client";
import { SaveTrainingDto } from "./dto/save-training.dto";
import { randomUUID } from "crypto";
import { EmployeesTrainingClosedEvent } from "./events/employees-training-closed.event";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PdfService } from "src/pdf/pdf.service";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
    private readonly pdfService: PdfService,
  ) { }

  async getTrainingModels() {
    return await this.prisma.trainingModel.findMany({
      include: {
        subjects: true,
      },
    });
  }

  async getTrainingsByUser(userId: number) {
    console.log("🚀 getTrainingsByUser appelé avec userId :", userId);
    const trainings = await this.prisma.training.findMany({
      where: { userId },
      include: {
        subjects: true,
        realizedBy: {
          select: {
            name: true,
          },
        },
      },
    });
    console.log("🚀 Formations récupérées :", trainings);
    return trainings;
  }


  async getTraining(trainingId: number) {
    return await this.prisma.training.findUnique({
      where: {
        id: trainingId
      },
      include: {
        subjects: {
          include: {
            files: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        realizedBy: {
          select: {
            name: true,
          },
        },
        userJobOnboarding: {
          select: {
            appointmentNumber: true,
          },
        },
      },
    });
  }

  async trainingAddAttachment({
    trainingId,
    trainingSubjectId,
    file,
    fileName,
  }: {
    trainingId: number;
    trainingSubjectId: number;
    file: Express.Multer.File;
    fileName: string;
  }) {
    const trainingSubject = await this.prisma.trainingSubject.findUnique({
      where: {
        id: trainingSubjectId,
        trainingId: trainingId,
      },
      include: { files: true },
    });
    if (!trainingSubject) throw new NotFoundException();
    const training = await this.prisma.training.findUnique({
      where: {
        id: trainingId,
      },
    });
    if (!training) throw new NotFoundException();
    const dir = `./upload/employees/${training.userId}/training/${trainingId}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFileName = `${randomUUID()}${path.extname(file.filename)}`;
    const fileNameWithExtension = `${fileName}${path.extname(file.filename)}`;
    fs.renameSync(file.path, join(dir, tempFileName));
    const trainingSubjectFile = await this.prisma.trainingSubjectFile.create({
      data: {
        fileName: fileNameWithExtension,
        filePath: join(dir, tempFileName),
        trainingSubjectId: trainingSubject.id,
      },
    });

    return trainingSubjectFile;
  }

  async closeTraining(trainingId: number, currentUser: CurrentUserType, dto: SaveTrainingDto) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subjects: true,
      },
    });

    if (!training) throw new NotFoundException('Formation introuvable');

    // 🔄 Mise à jour de la formation
    await this.prisma.training.update({
      where: { id: trainingId },
      data: {
        comment: dto.comment,
        tool: dto.tool,
        exercise: dto.exercise,
        validateAt: new Date(),
        realizedById: currentUser.sub,
        status: 'COMPLETED',
      },
    });

    // 🔄 Mise à jour des sujets
    for (const subject of dto.subjects) {
      await this.prisma.trainingSubject.update({
        where: { id: subject.subjectId },
        data: { state: subject.assessment },
      });
    }

    // 🔄 Mise à jour de l'intégration
    await this.prisma.userJobOnboarding.updateMany({
      where: {
        training: {
          some: {
            id: trainingId,
          },
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    // 🧾 Historique
    await this.prisma.userHistory.create({
      data: {
        title: 'Formation',
        text: `a validé la formation ${training.name}`,
        type: 'ACTION',
        userId: training.user.id,
        createdById: currentUser.sub,
      },
    });

    // 📄 Génération du PDF avec vérification du dossier
    const filePath = `./upload/employees/${training.user.id}/training/${training.id}/training-${Date.now()}.pdf`;
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await this.pdfService.createTrainingPdf(training.id, filePath);

    // 📩 Envoi du mail avec le PDF
    await this.mailService.sendTrainingMail(
      currentUser.name ?? "Formateur",
      `Validation de la formation : ${training.name}`,
      {
        fileName: `formation-${training.id}.pdf`,
        mimeType: 'application/pdf',
        filePath,
      },
    );

    // ✅ Event
    this.eventEmitter.emit('employees.training.closed', {
      trainingId,
      userId: training.user.id,
    });

    return { message: 'Formation validée et envoyée par mail avec succès.' };
  }



  async saveTraining(
    trainingId: number,
    dto: SaveTrainingDto,
  ) {
    const training = await this.prisma.training.update({
      where: { id: trainingId },
      data: {
        comment: dto.comment,
        tool: dto.tool,
        exercise: dto.exercise,
      },
    });

    await Promise.all(
      dto.subjects.map(async (subject) => {
        await this.prisma.trainingSubject.update({
          where: { id: subject.subjectId },
          data: {
            state: subject.assessment,
          },
        });
      }),
    );
  }

  async deleteAttachment(
    trainingId: number,
    attachmentId: number,
  ) {
    const attachment = await this.prisma.trainingSubjectFile.delete({
      where: { id: attachmentId, trainingSubject: { trainingId: trainingId } },
    });
    fs.unlinkSync(attachment.filePath);
  }

  async downloadAttachment(
    trainingId: number,
    attachmentId: number,
  ) {
    const attachment = await this.prisma.trainingSubjectFile.findUnique({
      where: { id: attachmentId, trainingSubject: { trainingId: trainingId } },
    });
    if (!attachment) throw new NotFoundException();
    return { filename: attachment.fileName, file: createReadStream(attachment.filePath) };
  }

  async markDocumentCompleted(employeeId: number, stepId: number, responseId: string, currentUserId: number) {
    try {
      const step = await this.prisma.userJobOnboarding.findUnique({
        where: { id: stepId },
        include: {
          jobOnboardingStep: {
            include: {
              jobOnboardingDocuments: true
            }
          },
          user: true
        }
      });

      if (!step || step.userId !== employeeId) {
        throw new NotFoundException("Étape introuvable pour cet employé.");
      }

      const updated = await this.prisma.userJobOnboarding.update({
        where: { id: stepId },
        data: {
          status: "COMPLETED",
          responseId
        }
      });

      await this.prisma.userHistory.create({
        data: {
          title: "Document",
          text: `a rempli le document \"${step.jobOnboardingStep.jobOnboardingDocuments[0]?.name || 'non nommé'}\"`,
          type: "ACTION",
          userId: employeeId,
          createdById: currentUserId
        }
      });

      return updated;
    } catch (error) {
      console.error("❌ Erreur dans markDocumentCompleted:", error);
      throw new HttpException('Erreur lors de la validation du document.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTrainingModel(id: number, dto: { tool?: string; exercise?: string; aide?: string }) {
    return await this.prisma.trainingModel.update({
      where: { id },
      data: {
        tool: dto.tool,
        exercise: dto.exercise,
        aide: dto.aide,
      },
    });
  }

  async updateTrainingModelSubject(id: number, dto: { name: string }) {
    return await this.prisma.trainingModelSubject.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async createTrainingModelSubject(trainingModelId: number, name: string) {
    return await this.prisma.trainingModelSubject.create({
      data: {
        name,
        trainingModel: { connect: { id: trainingModelId } },
      },
    });
  }

  async deleteTrainingModelSubject(subjectId: number) {
    return this.prisma.trainingModelSubject.delete({
      where: { id: subjectId },
    });
  }


}
