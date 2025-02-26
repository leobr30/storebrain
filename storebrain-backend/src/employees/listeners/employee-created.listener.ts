import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmployeeCreatedEvent } from '../events/employees-created.event';
import { MailService } from 'src/mail/mail.service';
import { PdfService } from 'src/pdf/pdf.service';
import fs from 'fs';
import path, { join } from 'path';
import { EmployeesService } from '../employees.service';
@Injectable()
export class EmployeeCreatedListener {
  constructor(
    private mailService: MailService,
    private pdfService: PdfService,
    private employeesService: EmployeesService,
  ) {}

  @OnEvent('employee.created')
  async handleOrderCreatedEvent(event: EmployeeCreatedEvent) {
    console.log(event.dto);
    const dir = `./upload/employees/${event.dto.userId}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const files = [];
    //PDF
    const pdfFileName = `Déclaration - ${event.dto.lastName} ${event.dto.firstName}.pdf`;
    await this.pdfService.createEmployeeCreatedPdf(
      event.dto,
      join(dir, pdfFileName),
    );
    files.push({
      fileName: pdfFileName,
      mimeType: 'application/pdf',
      filePath: join(dir, pdfFileName),
    });
    //CV
    const cvFileName = `CV -  ${event.dto.lastName} ${event.dto.firstName}${path.extname(event.dto.file.filename)}`;
    fs.renameSync(event.dto.file.path, join(dir, cvFileName));
    files.push({
      fileName: cvFileName,
      mimeType: event.dto.file.mimetype,
      filePath: join(dir, cvFileName),
    });
    await this.employeesService.createEmployeeCreatedDocument(
      event.dto.createdById,
      event.dto.userId,
      files,
    );
    //Send email
    await this.mailService.sendEmployeeCreatedMail(
      files,
      `${event.dto.companyName}: Nouvelle déclaration`,
    );
  }
}
