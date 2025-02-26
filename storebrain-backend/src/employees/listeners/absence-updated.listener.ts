import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AbsenceUpdatedEvent } from "../events/absence-updated.event";
import { EmployeesService } from "../employees.service";
import { PdfService } from "src/pdf/pdf.service";
import { join } from "path";

@Injectable()
export class AbsenceUpdatedListener {
  constructor(private readonly employeesService: EmployeesService,
    private pdfService: PdfService,
  ) {}

  @OnEvent('absence.updated')
  async handleAbsenceUpdatedEvent(event: AbsenceUpdatedEvent) {
    const absence = await this.employeesService.getAbsence(event.absenceId);
    const dir = `./upload/employees/${absence.userId}/absences`;
    const pdfFileName = `#${absence.id} Absence - ${absence.user.name}.pdf`;
    await this.pdfService.createAbsencePdf(event.absenceId, join(dir, pdfFileName));
    await this.employeesService.createDocument(pdfFileName, join(dir, pdfFileName), absence.userId, event.historyId, 'application/pdf');   
  }
}
