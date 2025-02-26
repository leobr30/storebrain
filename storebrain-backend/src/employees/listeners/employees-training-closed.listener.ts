import { PdfService } from "src/pdf/pdf.service";
import { EmployeesTrainingClosedEvent } from "../events/employees-training-closed.event";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { join } from "path";
import { TrainingsService } from "../trainings.service";
import { EmployeesService } from "../employees.service";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class EmployeesTrainingClosedListener {
  constructor(private pdfService: PdfService,
    private trainingsService: TrainingsService,
    private employeesService: EmployeesService,
    private mailService: MailService,
  ) {}

  @OnEvent('employees.training.closed')
  async handleEmployeesTrainingClosedEvent(event: EmployeesTrainingClosedEvent) {
    const training = await this.trainingsService.getTraining(event.trainingId);
    if (!training) {
      throw new NotFoundException('Training not found');
    }
    const dir = `./upload/employees/${training.userId}/training/${training.id}`;
    const pdfFileName = `Formation Rdv N°${training.userJobOnboarding.appointmentNumber} ${training.name} - ${training.user.name}.pdf`;
    await this.pdfService.createTrainingPdf(event.trainingId, join(dir, pdfFileName));
    await this.employeesService.createDocument(pdfFileName, join(dir, pdfFileName), training.userId, event.historyId, 'application/pdf');  
    await this.mailService.sendTrainingMail(training.realizedBy.name!, `${training.user.name} - Nouvelle formation Rdv N°${training.userJobOnboarding.appointmentNumber} ${training.name}`, {
      fileName: pdfFileName,
      mimeType: 'application/pdf',
      filePath: join(dir, pdfFileName),
    });
}
}
