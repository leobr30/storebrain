import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import { Table, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { CreateEmployeePdfDto } from 'src/employees/dto/create-employee-pdf.dto';
import { State, UserAbsence, UserAbsenceType } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service';
import { format } from 'date-fns';

@Injectable()
export class PdfService {

  constructor(private readonly prismaService: PrismaService) {}

  private readonly fonts = {
    Inter: {
      normal: './src/pdf/fonts/Inter-Regular.ttf',
      bold: './src/pdf/fonts/Inter-Bold.ttf',
    },
  };

  //Here for future reference of buffer
  async generateEmployeeCreatedPdf(
    dto: CreateEmployeePdfDto,
    fileName: string,
  ) {
    const printer = new PdfPrinter(this.fonts);
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const docDefinition: TDocumentDefinitions = {
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
                [
                  { text: 'NATIONALITE', bold: true },
                  { text: dto.nationality },
                ],
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
          font: 'Inter',
          margin: 500,
        },
      };

      const options = {};

      const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
      pdfDoc.info.Title = fileName;
      const buffer: any[] = [];
      pdfDoc.on('data', buffer.push.bind(buffer));
      pdfDoc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      pdfDoc.end();
    });

    return pdfBuffer;
  }

  async createEmployeeCreatedPdf(dto: CreateEmployeePdfDto, filePath: string) {
    const printer = new PdfPrinter(this.fonts);

    const docDefinition: TDocumentDefinitions = {
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
        font: 'Inter',
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
          include:{
            companies: {
              select:{
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
              ...absence.type === UserAbsenceType.MEDICAL ? [[{text:"DATES",bold:true} , {text:`Du ${absence.sicknessStartDate?.toLocaleDateString()} au ${absence.sicknessEndDate?.toLocaleDateString()}`}]] : [],
              ...absence.type === UserAbsenceType.DEATH ? [[{text:"LIEN DE PARENTÉ",bold:true} , {text:absence.familyRelationShip}]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{text:"HEURE DE L'ACCIDENT",bold:true} , {text:absence.timeOfAccident?.toLocaleTimeString()}]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{text:"LIEU DE L'ACCIDENT",bold:true} , {text:absence.placeOfAccident}]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{text:"CIRCONSTANCES",bold:true} , {text:absence.circumstances}]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{text:"LESIONS",bold:true} , {text:absence.injuries}]] : [],
              ...absence.type === UserAbsenceType.ACCIDENT_AT_WORK || absence.type === UserAbsenceType.TRANSPORT_ACCIDENT ? [[{text:"HORAIRE PLANNING",bold:true} , {text:absence.schedule?.toLocaleTimeString()}]] : [],
            ]
          },
        },
        {
          marginTop:  16,
          table: {
            widths: ['*', '*'],
            body: [[`Crée le ${new Date().toLocaleString()}`, `Par ${absence.createdBy.name}`]],
          },
        },
      ],
      defaultStyle: {
        font: 'Inter',
        margin: 500,
      },
    };
    const options = {};
    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();    
    return;
    
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
            files:true
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
    let docDefinition: TDocumentDefinitions = {content: [
      { text: `Formation: Rdv N°${training?.userJobOnboarding.appointmentNumber} - ${training?.name}`, alignment: 'center', margin: 5, bold: true, fontSize: 12 },
      { text: `Salarié: ${training?.user.name}`, alignment: 'center', margin: 5 },
      {table: {
        widths: ['*', '*', '*'],
        body: [
          [{text: 'Sujet', bold: true}, {text: 'Statut', bold: true}, {text: 'NB Fichiers', bold: true}],
          ...training!.subjects.map(subject => [
            {text: subject.name},
            {text: stateName(subject.state)},
            {text: subject.files.length}
          ])
        ]
      },
    marginTop: 16},
      {text: 'Commentaire - Autres:', bold: true, marginTop: 16},
      {text: training!.comment},
      {text: 'Outils:', bold: true, marginTop: 16},
      {text: training!.tool},
      {text: 'Exercice:', bold: true, marginTop: 16},
      {text: training!.exercise},
    ],
    footer: [
      {text: `Formation réalisée le: ${training?.validateAt?.toLocaleDateString()} par ${training?.realizedBy.name}`, alignment: 'center', margin: 5 },
    ],
    defaultStyle: {
      font: 'Inter',
      margin: 500,
    },};
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();
    return;
   }
}
