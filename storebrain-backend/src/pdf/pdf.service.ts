import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import fs from 'fs';
import { Table, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { CreateEmployeePdfDto } from 'src/employees/dto/create-employee-pdf.dto';
import { State, UserAbsence, UserAbsenceType, QuizzAnswer, QuizzQuestion } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service';
import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import PdfPrinter from 'pdfmake';
import path from 'path';
import dayjs from 'dayjs';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { randomUUID } from 'crypto';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { MailService } from 'src/mail/mail.service';
import { YousignService } from 'src/yousign/yousign.service';


@Injectable()
export class PdfService {

  constructor(private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly yousignService: YousignService,
  ) { }


  private readonly fonts = {
    Roboto: {
      normal: path.join(process.cwd(), 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf'),
      bold: path.join(process.cwd(), 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf'),
    },
  };

  //Here for future reference of buffer
  async generateEmployeeCreatedPdf(responseData: any, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log("📄 [PDF Service] Début de la génération du PDF...");

        const doc = new PDFDocument({ margin: 50, layout: 'landscape' }); // Ajout de layout: 'landscape'
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.font('Helvetica-Bold').fontSize(20).text("Formulaire Rempli", { align: 'center' });
        doc.moveDown();

        const userName = typeof responseData.user === 'object'
          ? responseData.user.name || responseData.user.fullName || "Inconnu"
          : responseData.user;

        doc.font('Helvetica').fontSize(12).text(`Employé : ${userName}`, { align: 'left' });
        doc.text(`Date : ${new Date().toLocaleDateString()}`, { align: 'left' });
        doc.moveDown();

        doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // 🛠 Correction : Convertir `responses` en tableau si c'est un objet
        let responsesArray = [];
        if (responseData.responses && typeof responseData.responses === 'object' && !Array.isArray(responseData.responses)) {
          responsesArray = Object.keys(responseData.responses).map(key => ({
            title: key,
            items: [{ label: responseData.responses[key], selected: true }] // 🔥 Assumer qu'il est sélectionné
          }));
        } else if (Array.isArray(responseData.responses)) {
          responsesArray = responseData.responses;
        } else {
          console.error("❌ Erreur: Le format des réponses est invalide.");
          reject(new HttpException("Format des réponses non reconnu.", HttpStatus.INTERNAL_SERVER_ERROR));
          return;
        }

        console.log("✅ Responses après conversion :", responsesArray);

        responsesArray.forEach((section: any) => {
          doc.font('Helvetica-Bold').fontSize(14).text(`${section.title}`, { underline: true });
          doc.moveDown(0.5);

          section.items.forEach((item: any) => {
            const checkbox = item.selected ? "Oui" : "Non";
            doc.font('Helvetica').fontSize(12).text(`${checkbox} ${item.label}`, { continued: false });
          });

          doc.moveDown();
          doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        });

        doc.end();

        writeStream.on('finish', () => {
          console.log("✅ [PDF Service] PDF généré avec succès !");
          resolve(filePath);
        });

        writeStream.on('error', (err) => {
          console.error("❌ [PDF Service] Erreur lors de l'écriture du fichier :", err);
          reject(new HttpException('Erreur de génération du PDF', HttpStatus.INTERNAL_SERVER_ERROR));
        });

      } catch (error) {
        console.error("❌ [PDF Service] Erreur dans generateEmployeeCreatedPdf:", error);
        reject(new HttpException('Erreur de génération du PDF', HttpStatus.INTERNAL_SERVER_ERROR));
      }
    });
  }

  async generateOmarPdf(omarId: number): Promise<Buffer> {
    const omar = await this.prismaService.omar.findUnique({
      where: { id: omarId },
      include: {
        user: true,
        createdBy: true,
      },
    });

    if (!omar) throw new NotFoundException('OMAR non trouvé');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => { });

    // 💠 Header stylisé
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill('#1f2937')
      .fillColor('#ffffff')
      .fontSize(26)
      .font('Helvetica-Bold')
      .text(`OMAR de ${omar.user.name}`, 50, 30, { align: 'center' });

    doc.moveDown(2);

    // 🧾 Détails du créateur et de la date
    doc
      .fillColor('#111827')
      .fontSize(12)
      .font('Helvetica')
      .text(` Créé par : ${omar.createdBy?.name ?? 'Non renseigné'}`)
      .text(` Date de création : ${omar.createdAt.toLocaleDateString()}`);

    doc.moveDown(1.5);

    // 🧩 Section utility
    const drawSection = (title: string, value: string | null) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#1f2937')
        .text(` ${title}`, { underline: false });

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#374151')
        .text(value?.trim() || 'Non renseigné', {
          indent: 20,
          lineGap: 4,
        });

      doc.moveDown(1);
    };

    // 📌 Contenu structuré
    drawSection('Objectif', omar.objective);
    drawSection('Moyens', omar.tool);
    drawSection('Actions', omar.action);
    drawSection('Constat - Évaluation', omar.observation);
    drawSection('Résultat', omar.result);
    drawSection('Prochain rendez-vous', omar.nextAppointment?.toLocaleDateString() || null);
    drawSection('Échéance', omar.dueDate?.toLocaleDateString() || null);

    // 📎 Pied de page
    doc
      .moveDown(2)
      .fontSize(10)
      .fillColor('#9ca3af')
      .text('Document généré automatiquement par le système Diamantor.', {
        align: 'center',
      });

    doc.end();
    await new Promise(resolve => doc.on('end', resolve));

    return Buffer.concat(buffers);
  }



  async createEmployeeCreatedPdf(dto: CreateEmployeePdfDto, filePath: string) {
    const printer = new PdfPrinter(this.fonts);

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4', // Ajout de pageSize: 'A4'
      pageOrientation: 'landscape', // Ajout de pageOrientation: 'landscape'
      content: [
        { text: 'NOUVEAU SALARIE', alignment: 'center', margin: 5 },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: `M${dto.companyNumber}`,
                  colSpan: 2,
                  alignment: 'center',
                },
                {},
              ],
              [{ text: 'NOM', bold: true }, { text: dto.lastName }],
              [{ text: 'PRENOM', bold: true }, { text: dto.firstName }],
              [
                { text: 'NOM DE JEUNE FILLE', bold: true },
                { text: dto.maidenName },
              ],
              [
                { text: 'DATE DE NAISSANCE', bold: true },
                { text: dto.dateOfBirth },
              ],
              [
                { text: 'LIEU DE NAISSANCE', bold: true },
                { text: dto.placeOfBirth },
              ],
              [
                { text: 'NUMERO DE SECURITE SOCIALE', bold: true },
                { text: dto.socialSecurityNumber },
              ],
              [{ text: 'NATIONALITE', bold: true }, { text: dto.nationality }],
              [{ text: 'ADRESSE', bold: true }, { text: dto.address }],
              [{ text: 'CODE POSTAL', bold: true }, { text: dto.zipCode }],
              [{ text: 'VILLE', bold: true }, { text: dto.city }],
              [{ text: 'ADRESSE MAIL', bold: true }, { text: dto.email }],
              [{ text: 'TEL PORTABLE', bold: true }, { text: dto.cellPhone }],
              [
                { text: 'SITUATION DE FAMILLE', bold: true },
                { text: dto.familySituation },
              ],
              [
                { text: "NOMBRE D'ENFANT", bold: true },
                { text: dto.numberOfChildren },
              ],
              [{ text: 'DATE ENTREE', bold: true }, { text: dto.entryDate }],
              [{ text: 'N° BADGE', bold: true }, { text: dto.bagdeNumber }],
              [{ text: 'EMLOI', bold: true }, { text: dto.job }],
              [{ text: 'CONTRAT', bold: true }, { text: dto.contract }],
              [{ text: 'ZONE', bold: true }, { text: dto.zone }],
              [{ text: 'DATE DE FIN', bold: true }, { text: dto.endDate }],
            ],
          },
          marginBottom: 5,
        },
        {
          table: {
            widths: ['*', '*'],
            body: [[`Crée le ${dto.createdAt}`, `Par ${dto.createdBy}`]],
          },
        },
      ],
      defaultStyle: {
        font: 'Roboto',
        margin: 500,
      },
    };

    const options = {};

    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    console.log(filePath);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();
    return;
  }

  async createAbsencePdf(absenceId: number, filePath: string) {


    const absence = await this.prismaService.userAbsence.findUnique({
      where: {
        id: absenceId
      },
      include: {
        user: {
          include: {
            companies: {
              select: {
                isDefault: true,
                company: {
                  select: {
                    name: true,
                    number: true
                  }
                }
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true
          }
        }
      }
    });

    if (!absence || !absence.user) {
      throw new Error('Absence not found');
    }

    const absenceName = (type: UserAbsenceType) => {
      switch (type) {
        case UserAbsenceType.UNJUSTIFIED_ABSENCE:
          return 'ABSENCE INJUSTIFIEE';
        case UserAbsenceType.DELAY:
          return 'RETARD';
        case UserAbsenceType.MEDICAL:
          return 'MALADIE'
        case UserAbsenceType.SICK_CHILDREN:
          return 'ENFANT MALADE'
        case UserAbsenceType.DEATH:
          return 'DECES'
        case UserAbsenceType.ACCIDENT_AT_WORK:
          return 'ACCIDENT DU TRAVAIL'
        case UserAbsenceType.TRANSPORT_ACCIDENT:
          return 'ACCIDENT DE TRANSPORT'
        default:
          return '';
      }
    }



    const printer = new PdfPrinter(this.fonts);
    let docDefinition: TDocumentDefinitions = {
      pageSize: 'A4', // Ajout de pageSize: 'A4'
      pageOrientation: 'landscape', // Ajout de pageOrientation: 'landscape'
      content: [
        { text: 'Absence Salarié', alignment: 'center', margin: 5 },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: `M${absence.user.companies.find(c => c.isDefault)?.company.number}`,
                  colSpan: 2,
                  alignment: 'center',
                },
                {},
              ],
              [{ text: 'NOM', bold: true }, { text: absence.user.lastName }],
              [{ text: 'PRENOM', bold: true }, { text: absence.user.firstName }],
              [{ text: 'EN ARRET', bold: true }, { text: `LE ${format(absence.startAt, 'dd/MM/yyyy')} A ${format(absence.startAt, 'HH:mm')}` }],
              [{ text: 'A REPRIS', bold: true }, { text: absence.endAt ? `LE ${format(absence.endAt, 'dd/MM/yyyy')} A ${format(absence.endAt, 'HH:mm')}` : '-' }],
              [{ text: 'MOTIF', bold: true }, { text: absenceName(absence.type) }],
              ...absence.type === UserAbsenceType.MEDICAL ? [[{ text: "DATES", bold: true }, { text: `Du ${absence.sicknessStartDate?.toLocaleDateString()} au ${absence.sicknessEndDate?.toLocaleDateString()}` }]] : [],
              ...absence.type === UserAbsenceType.DEATH ? [[{ text: "LIEN DE PARENTÉ", bold: true }, { text: absence.familyRelationShip }]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{ text: "HEURE DE L'ACCIDENT", bold: true }, { text: absence.timeOfAccident?.toLocaleTimeString() }]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{ text: "LIEU DE L'ACCIDENT", bold: true }, { text: absence.placeOfAccident }]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{ text: "CIRCONSTANCES", bold: true }, { text: absence.circumstances }]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{ text: "LESIONS", bold: true }, { text: absence.injuries }]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{ text: "HORAIRE PLANNING", bold: true }, { text: absence.schedule?.toLocaleTimeString() }]] : [],
            ]
          },
        },
        {
          marginTop: 16,
          table: {
            widths: ['*', '*'],
            body: [[`Crée le ${new Date().toLocaleString()}`, `Par ${absence.createdBy.name}`]],
          },
        },
      ],
      defaultStyle: {
        font: 'Roboto',
        margin: 500,
      },
    };
    const options = {};
    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();
    return;

  }


  async generateMondayAppointmentPdf(appointmentId: number): Promise<Buffer> {
    const appointment = await this.prismaService.mondayAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        company: true,
        details: {
          include: {
            user: true,
            omar: true,
          },
        },
      },
    });

    if (!appointment) throw new NotFoundException('Rendez-vous non trouvé');

    const printer = new PdfPrinter({
      Roboto: {
        normal: path.join(process.cwd(), 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf'),
        bold: path.join(process.cwd(), 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf'),
      },
    });

    // Objective Card Table
    const objectiveTableBody = [
      [
        { text: 'Zone', style: 'tableHeader' },
        { text: 'Objectif', style: 'tableHeader' },
        { text: 'Réalisé', style: 'tableHeader' },
        { text: 'Reste à réaliser', style: 'tableHeader' },
        { text: 'Jour restant', style: 'tableHeader' },
        { text: 'a réaliser par jour', style: 'tableHeader' },
      ],
      [
        'Magasin',
        `${appointment.objective.toLocaleString()} €`,
        `${appointment.realizedRevenue.toLocaleString()} €`,
        `${appointment.remainingRevenue >= 0 ? appointment.remainingRevenue.toLocaleString() : 0} €`,
        appointment.remainingDays.toString(),
        `${appointment.realizedRevenue >= appointment.objective ? 0 : Math.round((appointment.remainingRevenue) / appointment.remainingDays).toLocaleString()} €`,
      ],
      [
        'OR',
        `${appointment.objectiveOr.toLocaleString()} €`,
        `${appointment.realizedRevenueOr.toLocaleString()} €`,
        `${appointment.remainingRevenueOr >= 0 ? appointment.remainingRevenueOr.toLocaleString() : 0} €`,
        appointment.remainingDays.toString(),
        `${appointment.realizedRevenueOr >= appointment.objectiveOr ? 0 : Math.round((appointment.remainingRevenueOr) / appointment.remainingDays).toLocaleString()} €`,
      ],
      [
        'MODE',
        `${appointment.objectiveMode.toLocaleString()} €`,
        `${appointment.realizedRevenueMode.toLocaleString()} €`,
        `${appointment.remainingRevenueMode >= 0 ? appointment.remainingRevenueMode.toLocaleString() : 0} €`,
        appointment.remainingDays.toString(),
        `${appointment.realizedRevenueMode >= appointment.objectiveMode ? 0 : Math.round((appointment.remainingRevenueMode) / appointment.remainingDays).toLocaleString()} €`,
      ],
    ];

    const tableBody = [
      [
        { text: 'Nom', style: 'tableHeader' },
        { text: 'Objectif', style: 'tableHeader' },
        { text: 'Réalisé', style: 'tableHeader' },
        { text: 'Restant', style: 'tableHeader' },
        { text: 'Jours Restants', style: 'tableHeader' },
        { text: 'OMAR', style: 'tableHeader' },
      ],
    ];

    appointment.details.forEach((detail: any) => {
      const omarTableBody = detail.omar
        ? [
          [
            { text: 'Objectif', style: 'omarTableHeader' },
            { text: detail.omar.objective, style: 'omarTableCell' },
          ],
          [
            { text: 'Actions', style: 'omarTableHeader' },
            { text: detail.omar.action, style: 'omarTableCell' },
          ],
          [
            { text: 'Résultat', style: 'omarTableHeader' },
            { text: detail.omar.result, style: 'omarTableCell' },
          ],
          [
            { text: 'Observation', style: 'omarTableHeader' },
            { text: detail.omar.observation, style: 'omarTableCell' },
          ],
          [
            { text: 'Statut', style: 'omarTableHeader' },
            { text: detail.omar.status, style: 'omarTableCell' },
          ],
        ]
        : [[{ text: 'Aucun OMAR', style: 'omarTableCell', colSpan: 2 }, {}]];

      tableBody.push([
        detail.fullname,
        `${detail.objective} €`,
        `${detail.realizedRevenue} €`,
        `${detail.remainingRevenue} €`,
        detail.remainingDays.toString(),
        {
          table: {
            widths: ['auto', '*'],
            body: omarTableBody,

          },
          layout: {
            ...this.getLayout(),
            hLineWidth: function (i: number, node: any) {
              return 0.5;
            },
            vLineWidth: function (i: number, node: any) {
              return 0.5;
            },
            hLineColor: function (i: number, node: any) {
              return 'gray';
            },
            vLineColor: function (i: number, node: any) {
              return 'gray';
            },
            paddingLeft: function (i: number, node: any) { return 5; },
            paddingRight: function (i: number, node: any) { return 5; },
            paddingTop: function (i: number, node: any) { return 5; },
            paddingBottom: function (i: number, node: any) { return 5; },
            noWrap: false,
          },
        },
      ]);
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4', // Ajout de pageSize: 'A4'
      pageOrientation: 'landscape', // Ajout de pageOrientation: 'landscape'
      content: [
        { text: `Rendez-vous du ${format(appointment.date, 'dd/MM/yyyy')}`, style: 'header' },
        { text: `Entreprise : ${appointment.company.name}`, style: 'subheader' },
        { text: `Objectif de l'entreprise : ${appointment.objective} €`, style: 'subheader' },
        {
          margin: [0, 20, 0, 20],
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: objectiveTableBody,
          },
          layout: {
            fillColor: function (rowIndex: number, node: any, columnIndex: number) {
              return rowIndex === 0 ? '#007bff' : rowIndex % 2 === 0 ? '#f2f2f2' : null;
            },
            hLineWidth: function (i: number, node: any) {
              return i === 0 || i === node.table.body.length ? 2 : 1;
            },
            vLineWidth: function (i: number, node: any) {
              return 1;
            },
            hLineColor: function (i: number, node: any) {
              return i === 0 || i === node.table.body.length ? 'black' : 'gray';
            },
            vLineColor: function (i: number, node: any) {
              return 'gray';
            },
            paddingLeft: function (i: number, node: any) { return 10; },
            paddingRight: function (i: number, node: any) { return 10; },
            paddingTop: function (i: number, node: any) { return 10; },
            paddingBottom: function (i: number, node: any) { return 10; },
          },
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: [80, 60, 60, 60, 60, '*'], // Adjusted widths
            body: tableBody,
          },
          layout: {
            fillColor: function (rowIndex: number, node: any, columnIndex: number) {
              return rowIndex === 0 ? '#007bff' : rowIndex % 2 === 0 ? '#f2f2f2' : null;
            },
            hLineWidth: function (i: number, node: any) {
              return i === 0 || i === node.table.body.length ? 2 : 1;
            },
            vLineWidth: function (i: number, node: any) {
              return 1;
            },
            hLineColor: function (i: number, node: any) {
              return i === 0 || i === node.table.body.length ? 'black' : 'gray';
            },
            vLineColor: function (i: number, node: any) {
              return 'gray';
            },
            paddingLeft: function (i: number, node: any) { return 10; },
            paddingRight: function (i: number, node: any) { return 10; },
            paddingTop: function (i: number, node: any) { return 10; },
            paddingBottom: function (i: number, node: any) { return 10; },
          },
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 20],
          alignment: 'center',
          color: '#333333',
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 15],
          alignment: 'center',
          color: '#555555',
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'white',
        },
        omarTableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black',
        },
        omarTableCell: {
          fontSize: 10,
          color: 'black',
        },
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: any[] = [];
    pdfDoc.on('data', buffers.push.bind(buffers));
    pdfDoc.on('end', () => { });
    pdfDoc.end();

    return new Promise((resolve, reject) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
      pdfDoc.on('error', reject);
    });
  }

  getLayout() {
    return {
      paddingLeft: function (i: number, node: any) { return 5; },
      paddingRight: function (i: number, node: any) { return 5; },
      paddingTop: function (i: number, node: any) { return 5; },
      paddingBottom: function (i: number, node: any) { return 5; },
    }
  }





  async createTrainingPdf(trainingId: number, filePath: string) {
    const training = await this.prismaService.training.findUnique({
      where: {
        id: trainingId
      },
      include: {
        user: {
          select: {
            name: true,
            lastName: true,
            firstName: true
          },
        },
        subjects: {
          include: {
            files: true
          }
        },
        realizedBy: {
          select: {
            name: true
          }
        },
        userJobOnboarding: {
          select: {
            appointmentNumber: true
          }
        }
      }
    });

    const stateName = (state: State) => {
      switch (state) {
        case State.ACQUIRED:
          return 'Acquis';
        case State.IN_PROGRESS:
          return 'En cours d\'acquisition';
        case State.NOT_ACQUIRED:
          return 'Non acquis';
      }
    }
    const printer = new PdfPrinter(this.fonts);
    let docDefinition: TDocumentDefinitions = {
      pageSize: 'A4', // Ajout de pageSize: 'A4'
      pageOrientation: 'landscape', // Ajout de pageOrientation: 'landscape'
      content: [
        { text: `Formation: Rdv N°${training?.userJobOnboarding.appointmentNumber} - ${training?.name}`, alignment: 'center', margin: 5, bold: true, fontSize: 12 },
        { text: `Salarié: ${training?.user.name}`, alignment: 'center', margin: 5 },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [{ text: 'Sujet', bold: true }, { text: 'Statut', bold: true }, { text: 'NB Fichiers', bold: true }],
              ...training!.subjects.map(subject => [
                { text: subject.name },
                { text: stateName(subject.state) },
                { text: subject.files.length }
              ])
            ]
          },
          marginTop: 16
        },
        { text: 'Commentaire - Autres:', bold: true, marginTop: 16 },
        { text: training!.comment },
        { text: 'Outils:', bold: true, marginTop: 16 },
        { text: training!.tool },
        { text: 'Exercice:', bold: true, marginTop: 16 },
        { text: training!.exercise },
      ],
      footer: [
        {
          text: `Formation réalisée le: ${training?.validateAt?.toLocaleDateString()} par ${training?.realizedBy?.name ?? 'Inconnu'}`,
          alignment: 'center',
          margin: 5
        },
      ],
      defaultStyle: {
        font: 'Roboto',
        margin: 500,
      },
    };
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();
    return;
  }

  async generateQuizzPdf(quizzTitle: string, employeeName: string, answers: { question: QuizzQuestion; answer: string }[]): Promise<Buffer> {

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => { });

    // Optionnel : Logo en haut à gauche
    // const logoPath = path.resolve(__dirname, '../../assets/logo.png');
    // doc.image(logoPath, 50, 50, { width: 60 });

    // Titre
    doc
      .fillColor('#1F2937')
      .font('Helvetica-Bold')
      .fontSize(26)
      .text(`Quizz : ${quizzTitle}`, { align: 'center' });

    doc
      .moveDown(0.5)
      .fillColor('#374151')
      .font('Helvetica')
      .fontSize(18)
      .text(`Réponses de : ${employeeName}`, { align: 'center' });

    doc
      .moveDown()
      .strokeColor('#D1D5DB')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(2);

    // Boucle sur les questions/réponses
    answers.forEach((answer, index) => {
      const startY = doc.y;

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#111827')
        .text(`Question ${index + 1}`, { underline: true });

      doc
        .moveDown(0.3)
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#1F2937')
        .text(answer.question.text, {
          width: 480,
        });

      doc
        .moveDown(0.5)
        .font('Helvetica-Bold')
        .fillColor('#10B981')
        .text('Réponse :');

      // Zone colorée pour la réponse
      const answerText = answer.answer || '(Aucune réponse)';
      const textHeight = doc.heightOfString(answerText, {
        width: 470,
      });

      doc
        .moveDown(0.2)
        .rect(55, doc.y - 2, 490, textHeight + 10)
        .fill('#F0FDF4');

      doc
        .fillColor('#1F2937')
        .font('Helvetica')
        .text(answerText, 60, doc.y, {
          width: 480,
          lineGap: 4,
        });

      doc.moveDown();

      // Ligne de séparation
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(0.5)
        .moveTo(50, doc.y + 5)
        .lineTo(550, doc.y + 5)
        .stroke();

      doc.moveDown(1.5);
    });

    // Footer avec date
    const date = dayjs().format('DD/MM/YYYY');
    doc
      .fontSize(10)
      .fillColor('#9CA3AF')
      .text(`📅 Généré le ${date}`, 50, 770, { align: 'center' });

    doc.end();

    await new Promise((resolve) => doc.on('end', resolve));
    return Buffer.concat(buffers);
  }


  async mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFLibDocument.create();

    for (const pdfBuffer of buffers) {
      const pdf = await PDFLibDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalBuffer = await mergedPdf.save();
    return Buffer.from(finalBuffer);
  }



  async generateUnsignedDocumentsPdf(userId: string): Promise<Buffer> {
    const parsedUserId = parseInt(userId);
    const tempDir = join(tmpdir(), `unsigned-documents-${randomUUID()}`);
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    const pdfBuffers: Buffer[] = [];

    // 🔹 Formations
    const formations = await this.prismaService.training.findMany({
      where: { userId: parsedUserId, dateSignature: null },
    });

    for (const formation of formations) {
      const filePath = join(tempDir, `training-${formation.id}.pdf`);
      await this.createTrainingPdf(formation.id, filePath);

      // ⚠️ Attendre que le fichier soit réellement écrit
      let retries = 0;
      while (!existsSync(filePath) && retries < 10) {
        await new Promise((res) => setTimeout(res, 100));
        retries++;
      }

      if (!existsSync(filePath)) {
        console.error(`❌ Le fichier PDF ${filePath} n'existe toujours pas après tentative.`);
        continue; // ou throw new Error(...) si tu préfères échouer
      }

      const buffer = readFileSync(filePath);
      pdfBuffers.push(buffer);

    }

    // 🔹 Quizz
    const quizz = await this.prismaService.quizz.findMany({
      where: { assignedToId: parsedUserId, dateSignature: null },
    });

    for (const quiz of quizz) {
      const answers = await this.prismaService.quizzAnswer.findMany({
        where: { id: quiz.id, userId: parsedUserId },
        include: { question: true },
      });

      const formattedAnswers = answers.map((a) => ({
        question: a.question,
        answer: a.text || '',
      }));

      const employee = await this.prismaService.user.findUnique({
        where: { id: parsedUserId },
      });

      const buffer = await this.generateQuizzPdf(
        quiz.title,
        employee?.name || 'Employé',
        formattedAnswers,
      );
      pdfBuffers.push(buffer);
    }

    // 🔹 Documents (via EmployeeResponse)
    const responses = await this.prismaService.employeeResponse.findMany({
      where: {
        userId: parsedUserId,
        form: {
          dateSignature: null,
        },
      },
      include: {
        user: true,
        form: true,
      },
    });

    for (const response of responses) {
      const filePath = join(tempDir, `form-${response.formId}.pdf`);

      const responseData = {
        user: response.user,
        responses: response.responses, // JSON structure
      };

      await this.generateEmployeeCreatedPdf(responseData, filePath);
      const buffer = readFileSync(filePath);
      pdfBuffers.push(buffer);
    }



    // 🔹 Omars
    const omars = await this.prismaService.omar.findMany({
      where: { userId: parsedUserId, dateSignature: null },
    });

    for (const omar of omars) {
      const buffer = await this.generateOmarPdf(omar.id);
      pdfBuffers.push(buffer);
    }

    // 🔹 Fusion des PDF
    const mergedPdf = await this.mergePdfBuffers(pdfBuffers);

    // Nettoyage temporaire
    rmSync(tempDir, { recursive: true, force: true });

    return mergedPdf;
  }


  async sendUnsignedDocumentsByEmail(userId: string, email: string) {
    try {
      const mergedPdf = await this.generateUnsignedDocumentsPdf(userId);

      // ✅ Envoi par e-mail
      await this.mailService.sendMailWithAttachment({
        to: email,
        subject: '📄 Documents à signer',
        text: 'Veuillez trouver ci-joint les documents à signer.',
        attachments: [
          {
            filename: 'documents-a-signer.pdf',
            content: mergedPdf,
          },
        ],
      });

      // ✅ Envoi à Yousign
      await this.yousignService.sendToSignature(userId, mergedPdf, 'form', 'merged');

      // ✅ Mise à jour des champs de signature
      const now = new Date();
      const parsedUserId = parseInt(userId);

      // ✅ Mise à jour des Form liés aux EmployeeResponses
      const responses = await this.prismaService.employeeResponse.findMany({
        where: {
          userId: parsedUserId,
          form: { dateSignature: null },
        },
        select: { formId: true },
      });

      const uniqueFormIds = [...new Set(responses.map(r => r.formId))];

      if (uniqueFormIds.length > 0) {
        await this.prismaService.form.updateMany({
          where: {
            id: { in: uniqueFormIds },
          },
          data: {
            dateSignature: now,
          },
        });
      }

      return { success: true, message: 'Documents envoyés par e-mail et à Yousign.' };
    } catch (error) {
      console.error("❌ Erreur dans sendUnsignedDocumentsByEmail :", error);
      throw new HttpException("Erreur lors de l'envoi des documents", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }








}
