import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JobsService } from 'src/jobs/jobs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import fs from 'fs';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  ContractNotFoundException,
  JobNotFoundException,
  UserNotFoundException,
} from './employees.errors';
import { CompaniesService } from 'src/companies/companies.service';
import { CompanyNotFoundException } from 'src/companies/companies.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmployeeCreatedEvent } from './events/employees-created.event';
import { PdfService } from 'src/pdf/pdf.service';
import { CreateEmployeePdfDto } from './dto/create-employee-pdf.dto';
import { State, Status, UserAbsenceType, UserDocument, UserHistory } from '@prisma/client';
import { CurrentUserType } from 'src/auth/dto/current-user.dto';
import { ActivateEmployeeDto } from './dto/activate-employee.dto';
import { compare, hash } from 'bcrypt';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { add, addDays, endOfMonth, format, getMonth, isAfter, isSunday, startOfDay, startOfMonth } from 'date-fns';
import { CreateTrainingWithOnboardingDto } from './dto/create-training-with-onboarding.dto';
import path, { join } from 'path';
import { SaveTrainingDto } from './dto/save-training.dto';
import { LoginDto } from 'src/auth/dto/auth.dto';
import { UpdateAbsenceDto } from './dto/create-absence.dto';
import { CreateAppointmentDto } from './dto/create-monday-appointment.dto';
import { OnedocService } from 'src/onedoc/onedoc.service';
import { OnerpService } from 'src/onerp/onerp.service';
import { OmarDto } from './dto/save-omar.dto';
import { ValidateOmarDto } from './dto/validate-omar.dto';
import { AbsenceUpdatedEvent } from './events/absence-updated.event';
import { User } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private jobsService: JobsService,
    private companiesService: CompaniesService,
    private eventEmitter: EventEmitter2,
    private integrationsService: IntegrationsService,
    private onedocService: OnedocService,
    private onerpService: OnerpService,
  ) { }

  async getEmployees(companyId?: number) {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        zone: true,
        job: {
          select: {
            name: true,
          },
        },
        contract: {
          select: {
            type: true,
            workingHoursPerWeek: true,
          },
        },
        status: true,
      },
      // include: {
      //   job: true,
      //   contract: true,
      //   companies: true,
      // },
      where: {
        companies: companyId
          ? {
            some: {
              companyId: companyId,
            },
          }
          : undefined,
      },
    });
  }

  async createEmployee(
    dto: CreateEmployeeDto,
    file: Express.Multer.File,
    currentUser: CurrentUserType,
  ) {
    console.log(dto);
    //Check companies
    //TODO Check companies on user
    const company = await this.companiesService.getCompanyById(dto.companyId);
    if (company === null) throw new CompanyNotFoundException();
    //Check job
    const job = await this.jobsService.getJobById(dto.jobId);
    if (job === null) throw new JobNotFoundException();
    //Check contract
    const contract = job.jobContracts.find((w) => w.id === dto.contractId);
    if (contract === undefined) throw new ContractNotFoundException();
    //Create employee
    const user = await this.prisma.user.create({
      data: {
        lastName: dto.lastName,
        firstName: dto.firstName,
        name: `${dto.lastName} ${dto.firstName}`,
        entryDate: dto.entryDate,
        badgeNumber: dto.badgeNumber,
        jobId: job.id,
        contractId: contract.id,
        zone: dto.zone,
        information: {
          create: {
            maidenName: dto.maidenName,
            dateOfBirth: dto.dateOfBirth,
            placeOfBirth: dto.placeOfBirth,
            socialSecurityNumber: dto.socialSecurityNumber,
            nationality: dto.nationality,
            address: dto.address,
            zipCode: dto.zipCode,
            city: dto.city,
            cellPhone: dto.cellPhone,
            familySituation: dto.familySituation,
            numberOfChildren: dto.numberOfChildren,
            email: dto.email,
          },
        },
        companies: {
          create: {
            isDefault: true,
            company: {
              connect: {
                id: company.id,
              },
            },
          },
        },
      },
    });

    //Move files and rename

    //Raise event
    const pdfDto = new CreateEmployeePdfDto();
    pdfDto.userId = user.id;
    pdfDto.companyNumber = 19;
    pdfDto.companyName = company.name;
    pdfDto.lastName = dto.lastName;
    pdfDto.firstName = dto.firstName;
    pdfDto.maidenName = dto.maidenName;
    pdfDto.dateOfBirth = dto.dateOfBirth.toLocaleDateString();
    pdfDto.placeOfBirth = dto.placeOfBirth;
    pdfDto.socialSecurityNumber = dto.socialSecurityNumber;
    pdfDto.nationality = dto.nationality;
    pdfDto.address = dto.address;
    pdfDto.zipCode = dto.zipCode;
    pdfDto.city = dto.city;
    pdfDto.email = dto.email;
    pdfDto.cellPhone = dto.cellPhone;
    pdfDto.familySituation = dto.familySituation;
    pdfDto.numberOfChildren = dto.numberOfChildren;
    pdfDto.entryDate = dto.entryDate.toLocaleDateString();
    pdfDto.bagdeNumber = dto.badgeNumber;
    pdfDto.job = job.name;
    pdfDto.contract = `${contract.type} - ${contract.workingHoursPerWeek}H`;
    pdfDto.zone = '';
    pdfDto.endDate = '';
    pdfDto.createdAt = new Date().toLocaleString();
    pdfDto.createdBy = currentUser.name!;
    pdfDto.createdById = currentUser.sub!;
    pdfDto.file = file;
    console.log(pdfDto);
    this.eventEmitter.emit(
      'employee.created',
      new EmployeeCreatedEvent(pdfDto),
    );
    return user;
  }

  async getEmployee(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        job: {
          select: {
            name: true,
            onboardings: true,
          },
        },
        contract: {
          select: {
            type: true,
            workingHoursPerWeek: true,
          },
        },
        histories: {
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
            documents: true,
          },
        },
        jobOnboardings: {
          select: {
            id: true,
            date: true,
            status: true,
            appointmentNumber: true,
            responseId: true,
            jobOnboardingStep: {
              include: {
                trainingModel: true,
                jobOnboardingResultReview: true,
                jobOnboardingDocuments: true,
              }
            },
            training: {
              select: {
                id: true,
                status: true,
                subjects: {
                  select: {
                    id: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
        absences: {
          where: { type: { not: UserAbsenceType.VACATION } },
          select: {
            id: true,
            startAt: true,
            endAt: true,
            type: true,
            status: true,
            createdAt: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        },
        vacations: {
          where: { type: UserAbsenceType.VACATION },
          select: {
            id: true,
            startAt: true,
            endAt: true,
            type: true,
            status: true,
            createdAt: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }


  async activateEmployee(
    id: number,
    dto: ActivateEmployeeDto,
    currentUser: CurrentUserType,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (user === null) throw new UserNotFoundException();

    await this.prisma.user.update({
      data: {
        username: dto.username,
        password: await hash(dto.password, 10),
        status: Status.PENDING_ONBOARDING,
        histories: {
          create: {
            title: 'Activation',
            text: 'a activé le salarié',
            createdById: currentUser.sub,
          },
        },
      },
      where: {
        id: user.id,
      },
    });

    //TODO Handle roles based on job

    return;
  }

  async createEmployeeCreatedDocument(
    createdById: number,
    userId: number,
    files: { fileName: string; mimeType: string; filePath: string }[],
  ) {
    return await this.prisma.userHistory.create({
      data: {
        title: 'Déclaration',
        text: 'a déclaré le salarié',
        user: {
          connect: {
            id: userId,
          },
        },
        createdBy: {
          connect: {
            id: createdById,
          },
        },
        documents: {
          createMany: {
            data: files.map((file) => {
              return {
                fileName: file.fileName,
                filePath: file.filePath,
                mimeType: file.mimeType,
                userId: userId,
              };
            }),
          },
        },
      },
    });
  }

  async startIntegration(id: number, currentUser: CurrentUserType) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (user === null || user.jobId === null) throw new UserNotFoundException();
    console.log(user);
    const integration = await this.integrationsService.getIntegration(
      user.jobId,
    );
    //TODO ADD CUSTOM ERROR
    if (!integration) throw new NotFoundException();
    const data: {
      date: Date;
      appointmentNumber: number;
      jobOnboardingStepId: number;
      status: Status;
      userId: number;
    }[] = [];
    integration!.jobOnboardingSteps.map((step) => {
      if (step.type === 'TRAINING' && step.trainingModel) {
        for (let i = 1; i <= step.trainingModel!.numberOAppointmentsRequired; i++) {
          data.push({
            date: addDays(new Date(), step.day + i * 2),
            appointmentNumber: i,
            jobOnboardingStepId: step.id,
            status: Status.PENDING,
            userId: user.id,
          });
        }
      } else if (step.type === 'RESULT_REVIEW') {
        data.push({
          date: add(new Date(), { days: step.day, months: step.month }),
          appointmentNumber: 0,
          jobOnboardingStepId: step.id,
          status: Status.PENDING,
          userId: user.id,
        });
      } else if (step.type === 'DOCUMENT') {
        data.push({
          date: add(new Date(), { days: step.day, months: step.month }),
          appointmentNumber: 0,
          jobOnboardingStepId: step.id,
          status: Status.PENDING,
          userId: user.id,
        });
      }

    });
    await this.prisma.userJobOnboarding.createMany({
      data: data,
    });
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: 'ONBOARDING',
        histories: {
          create: {
            title: 'Intégration',
            text: "a débuté l'intégration.",
            createdById: currentUser.sub,
          },
        },
      },
    });
  }

  async createTrainingWithEmployeeOnboardingId(
    dto: CreateTrainingWithOnboardingDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: dto.userId,
      },
      include: {
        jobOnboardings: {
          include: {
            jobOnboardingStep: {
              include: {
                trainingModel: {
                  include: {
                    subjects: true,
                  }
                },
              },
            },
          },
        },
      },
    });
    const integration = user.jobOnboardings.find(
      (w) => w.id === dto.employeeJobOnboardId,
    );
    if (integration === undefined || !integration.jobOnboardingStep.trainingModel) throw new NotFoundException();

    const training = await this.prisma.training.create({
      data: {
        name: integration.jobOnboardingStep.trainingModel?.name,
        subjects: {
          create: integration.jobOnboardingStep.trainingModel?.subjects.map((subject) => ({
            name: subject.name,
          })),
        },
        comment: '',
        tool: integration.jobOnboardingStep.trainingModel.tool,
        exercise: '',
        realizedById: dto.currentUserId,
        userId: dto.userId,
        userJobOnboardingId: dto.employeeJobOnboardId,
      },
    });

    await this.prisma.userJobOnboarding.update({
      where: {
        id: dto.employeeJobOnboardId,
      },
      data: {
        status: Status.IN_PROGRESS,
      },
    });
    return training;
  }



  async checkCredentials(userId: number, dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        username: dto.username,
      },
    });
    if (!user || !user.password) throw new UnauthorizedException();
    return await compare(dto.password, user.password);
  }

  async createAbsence(userId: number, currentUser: CurrentUserType) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new UserNotFoundException();
    const absence = await this.prisma.userAbsence.create({
      data: {
        startAt: new Date(),
        type: UserAbsenceType.UNJUSTIFIED_ABSENCE,
        userId: userId,
        createdById: currentUser.sub,
        createdAt: new Date(),
        endAt: null,
        status: Status.DRAFT,
      },
    });
    return absence;
  }


  async updateAbsence(absenceId: number, dto: UpdateAbsenceDto, currentUser: CurrentUserType) {
    const absence = await this.prisma.userAbsence.findUnique({
      where: {
        id: absenceId,
      },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    const updatedAbsence = await this.prisma.userAbsence.update({
      where: {
        id: absenceId,
      },
      data: {
        startAt: dto.startAt,
        endAt: dto.endAt ?? null,
        type: dto.type,
        status: dto.endAt ? Status.COMPLETED : Status.IN_PROGRESS,
        sicknessStartDate: dto.sicknessStartDate ?? null,
        sicknessEndDate: dto.sicknessEndDate ?? null,
        familyRelationShip: dto.familyRelationShip ?? null,
        timeOfAccident: dto.timeOfAccident ?? null,
        schedule: dto.schedule ?? null,
        placeOfAccident: dto.placeOfAccident ?? null,
        circumstances: dto.circumstances ?? null,
        injuries: dto.injuries ?? null,
      },
    });
    const history = await this.prisma.userHistory.create({
      data: {
        title: 'Absence',
        text: updatedAbsence.status === Status.COMPLETED ? 'a complété une absence' : 'a créé une absence',
        type: 'ABSENCE',
        idUrl: absence.id.toString(),
        userId: absence.userId,
        createdById: currentUser.sub,
      },
    });
    this.eventEmitter.emit('absence.updated', new AbsenceUpdatedEvent(updatedAbsence.id, history.id));
    return updatedAbsence;
  }

  async getAppointments() {
    return await this.prisma.mondayAppointment.findMany({
      include: {
        company: {
          select: {
            name: true,
          }
        }
      }
    });
  }

  async createAppointment(dto: CreateAppointmentDto, currentUser: CurrentUserType) {



    const company = await this.companiesService.getCompanyById(dto.companyId);
    if (!company) throw new CompanyNotFoundException();

    const objective = await this.onedocService.getObjective(format(startOfMonth(dto.date), 'yyyy-MM-dd'), company.number)
    if (objective.length === 0) throw new NotFoundException("Objective not found");
    console.log(objective[0].objective)
    let realizedRevenue = 0
    const realizedRevenueResult = await this.onerpService.readRealizedRevenue(format(startOfMonth(dto.date), 'yyyy-MM-dd'), format(dto.date, 'yyyy-MM-dd'), company.number);
    if (realizedRevenueResult.length > 0) realizedRevenue = parseFloat(realizedRevenueResult[0].revenue.toString())


    const remainingDays = this.calculateRemainingDays(new Date());

    const revenueDetail = await this.onerpService.readRevenueDetail(format(startOfMonth(dto.date), 'yyyy-MM-dd'), format(dto.date, 'yyyy-MM-dd'), company.number);
    let realizedRevenueOr = 0
    let realizedRevenueMode = 0
    let realizedRevenueService = 0
    let realizedRevenueFourniture = 0
    revenueDetail.forEach(rd => {
      realizedRevenueOr += rd.revenueOr
      realizedRevenueMode += rd.revenueMode
      realizedRevenueService += rd.revenueService
      realizedRevenueFourniture += rd.revenueFourniture
    })
    //ADD Fourniture and Service
    realizedRevenueOr += (realizedRevenueFourniture + realizedRevenueService) / 2
    realizedRevenueMode += (realizedRevenueFourniture + realizedRevenueService) / 2
    const primeDetails = await this.onedocService.getPrimeDetails(objective[0].id)
    const appointmentDetails = await Promise.all(primeDetails.map(async (pd, index) => {
      const user = await this.getUserByOnerpId(pd.onerpId)
      let realizedRevenue = 0
      if (revenueDetail.find(rd => rd.onerpId === pd.onerpId)) {
        realizedRevenue = revenueDetail.find(rd => rd.onerpId === pd.onerpId)!.revenue
      }

      return {
        index,
        onerpId: pd.onerpId,
        fullname: pd.fullname,
        zone: pd.zone,
        objective: pd.objective,
        realizedRevenue: realizedRevenue,
        userId: user?.id
      }
    }))
    const appointment = await this.prisma.mondayAppointment.create({
      data: {
        date: dto.date,
        companyId: dto.companyId,
        objective: objective[0].objective,
        objectiveOr: objective[0].objectiveOr,
        objectiveMode: objective[0].objectiveMode,
        realizedRevenue,
        remainingRevenue: objective[0].objective - realizedRevenue,
        realizedRevenueOr,
        remainingRevenueOr: objective[0].objectiveOr - realizedRevenueOr,
        realizedRevenueMode,
        remainingRevenueMode: objective[0].objectiveMode - realizedRevenueMode,
        remainingDays,
        details: {
          createMany: {
            data: appointmentDetails.sort((a, b) => a.index - b.index).map(ad => {
              return {
                onerpId: ad.onerpId,
                fullname: ad.fullname,
                zone: ad.zone,
                objective: ad.objective,
                realizedRevenue: ad.realizedRevenue,
                remainingRevenue: ad.objective - ad.realizedRevenue,
                remainingDays: remainingDays,
                userId: ad.userId
              }
            })
          }
        }
      },
    });




    await this.prisma.userHistory.create({
      data: {
        title: 'Rendez-vous du lundi',
        text: 'a créé un nouveau rendez-vous du lundi',
        type: 'MONDAY_APPOINTMENT',
        idUrl: appointment.id.toString(),
        userId: currentUser.sub,
        createdById: currentUser.sub,
      },
    });

    return appointment;
  }

  async getAppointment(id: number) {
    const appointment = await this.prisma.mondayAppointment.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            omar: {
              select: {
                id: true,
                status: true,
              }
            }
          }
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    return appointment;
  }


  private calculateRemainingDays(date: Date): number {
    const endOfMonthDate = endOfMonth(date);
    let currentDate = date;
    let remainingDays = 0;

    while (isAfter(endOfMonthDate, currentDate) || endOfMonthDate.getTime() === currentDate.getTime()) {
      if (getMonth(date) !== 11 && !isSunday(currentDate)) { // 11 représente décembre (0-indexé)
        remainingDays++;
      } else if (getMonth(date) === 11) { // Pour décembre, on compte tous les jours
        remainingDays++;
      }
      currentDate = addDays(currentDate, 1);
    }

    return remainingDays;
  }

  async createOmar(data: {
    createdById: number;
    userId: number;
    appointmentDetailId?: number;
  }) {
    const omar = await this.prisma.omar.create({
      data: {
        objective: '',
        tool: '',
        action: '',
        result: '',
        observation: '',
        status: 'DRAFT',
        dueDate: addDays(startOfDay(new Date()), 5),
        createdBy: { connect: { id: data.createdById } },
        user: { connect: { id: data.userId } },
      },
    });

    if (data.appointmentDetailId) {
      await this.prisma.mondayAppointmentDetail.update({
        where: { id: data.appointmentDetailId },
        data: {
          omarId: omar.id
        }
      })
    }

    return omar
  }

  async getOmar(id: number) {
    return this.prisma.omar.findUnique({
      where: { id },
      include: {
        createdBy: true,
        user: {
          select: {
            name: true,
          }
        },
      },
    });
  }

  async saveOmar(id: number, dto: OmarDto) {
    return await this.prisma.omar.update({
      where: { id },
      data: {
        objective: dto.objective,
        tool: dto.tool,
        action: dto.action,
        observation: dto.observation,
        dueDate: dto.dueDate,
        nextAppointment: dto.nextAppointment,
      },
    });
  }

  async validateOmar(id: number, dto: ValidateOmarDto, currentUser: CurrentUserType) {
    const omar = await this.prisma.omar.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        createdById: currentUser.sub,
        observation: dto.observation,
        objective: dto.objective,
        tool: dto.tool,
        action: dto.action,
        dueDate: dto.dueDate,
        nextAppointment: dto.nextAppointment,
      },
    });

    await this.prisma.userHistory.create({
      data: {
        title: 'OMAR',
        text: 'a validé l\'OMAR',
        type: 'OMAR',
        idUrl: omar.id.toString(),
        userId: currentUser.sub,
        createdById: currentUser.sub,
      },
    });
    return omar;
  }

  async getUserByOnerpId(onerpId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        onerpId: onerpId,
      },
    });
    return user;
  }

  async signMondayAppointmentDetail(id: number, currentUser: CurrentUserType) {
    const appointmentDetail = await this.prisma.mondayAppointmentDetail.findUnique({
      where: { id },
    });

    if (!appointmentDetail) {
      throw new NotFoundException('Monday Appointment Detail not found');
    }

    const updatedAppointmentDetail = await this.prisma.mondayAppointmentDetail.update({
      where: { id },
      data: {
        signedAt: new Date(),
      },
    });

    return updatedAppointmentDetail;
  }

  async getAbsence(absenceId: number) {
    const absence = await this.prisma.userAbsence.findUnique({
      where: {
        id: absenceId,
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    return absence;
  }

  async createDocument(fileName: string, filePath: string, userId: number, historyId: number, mimeType: string) {
    return await this.prisma.userDocument.create({
      data: {
        fileName,
        mimeType,
        filePath,
        user: { connect: { id: userId } },
        history: { connect: { id: historyId } },
      },
    });
  }
  async addDocumentsToHistory(historyId: number, documents: UserDocument[]) {
    return await this.prisma.userHistory.update({
      where: { id: historyId },
      data: {
        documents: {
          connect: documents.map(d => ({ id: d.id }))
        }
      },
    });
  }

  async updateEmployee(id: number, updateData: Partial<User>) {
    console.log("🔍 Données reçues avant transformation :", updateData);

    const dataToUpdate: any = {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      entryDate: updateData.entryDate ? new Date(updateData.entryDate) : undefined,
      badgeNumber: updateData.badgeNumber,
      zone: updateData.zone,
    };

    // 🔍 Trouver l'ID du job en base
    if ((updateData as any).job && typeof (updateData as any).job === "string") {
      const job = await this.prisma.job.findFirst({ where: { name: (updateData as any).job } });
      if (job) {
        dataToUpdate.jobId = job.id;
      } else {
        console.warn(`⚠️ Job "${(updateData as any).job}" non trouvé.`);
      }
    }

    // 🔍 Trouver l'ID du contrat en base
    if ((updateData as any).contract && typeof (updateData as any).contract === "string") {
      const contract = await this.prisma.jobContract.findFirst({ where: { type: (updateData as any).contract } });
      if (contract) {
        dataToUpdate.contractId = contract.id;
      } else {
        console.warn(`⚠️ Contrat "${(updateData as any).contract}" non trouvé.`);
      }
    }

    console.log("🛠️ Données transformées envoyées à Prisma :", dataToUpdate);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'employé :", error);
      throw new Error("Échec de la mise à jour de l'utilisateur.");
    }
  }



  async createVacation(userId: number, vacationData: { startAt: string; endAt: string }, currentUser: CurrentUserType) {
    const vacation = await this.prisma.userAbsence.create({
      data: {
        userId,
        startAt: new Date(vacationData.startAt),
        endAt: new Date(vacationData.endAt),
        type: UserAbsenceType.VACATION,
        status: Status.IN_PROGRESS,
        createdById: currentUser.sub,
        createdAt: new Date(),
        vacationUserId: userId,
      },
    });
  
    await this.prisma.userHistory.create({
      data: {
        title: 'Vacances',
        text: `a déclaré des vacances du ${new Date(vacationData.startAt).toLocaleDateString()} au ${new Date(vacationData.endAt).toLocaleDateString()}`,
        type: 'ACTION',
        userId: userId,
        createdById: currentUser.sub,
      },
    });
  
    return vacation;
  }

  async updateVacation(
    employeeId: number,
    vacationId: number,
    vacationData: { startAt: Date; endAt: Date },
    currentUser: CurrentUserType
  ) {

    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!employee) throw new NotFoundException(`Employé avec l'ID ${employeeId} introuvable`);

    const vacation = await this.prisma.userAbsence.findUnique({
      where: { id: vacationId, userId: employeeId, type: UserAbsenceType.VACATION },
    });

    if (!vacation) throw new NotFoundException(`Vacances avec l'ID ${vacationId} introuvables`);

    return await this.prisma.userAbsence.update({
      where: { id: vacationId },
      data: {
        startAt: new Date(vacationData.startAt),
        endAt: new Date(vacationData.endAt),
      },
    });
  }


  async markDocumentCompleted(employeeId: number, stepId: number, responseId: string, currentUserId: number) {
    try {
      const step = await this.prisma.userJobOnboarding.findUnique({
        where: { id: stepId, userId: employeeId },
        include: {
          jobOnboardingStep: {
            include: {
              jobOnboardingDocuments: true,
            },
          },
        },
      });

      if (!step) throw new NotFoundException("Étape non trouvée.");

      await this.prisma.userJobOnboarding.update({
        where: { id: stepId },
        data: { status: "COMPLETED", responseId },
      });

      if (step.jobOnboardingStep?.jobOnboardingDocuments?.length > 0) {
        await this.prisma.userHistory.create({
          data: {
            title: 'Document',
            text: `a rempli le document ${step.jobOnboardingStep.jobOnboardingDocuments[0].name}`,
            type: 'ACTION',
            userId: employeeId,
            createdById: currentUserId,
          },
        });
      }

      return { message: "Document marked as completed", responseId };
    } catch (error) {
      console.error("❌ Erreur dans markDocumentCompleted:", error);
      throw new HttpException('Error marking document as completed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




  async getEmployeeVacations(employeeId: number) {
    return this.prisma.userAbsence.findMany({
      where: { userId: employeeId, type: UserAbsenceType.VACATION },
      include: { createdBy: { select: { name: true } } },
    });
  }

  async getEmployeeOnboarding(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        jobOnboardings: {
          select: {
            id: true,
            date: true,
            status: true,
            appointmentNumber: true,
            jobOnboardingStep: {
              include: {
                trainingModel: true,
                jobOnboardingResultReview: true,
                jobOnboardingDocuments: true,
              }
            },
            training: {
              select: {
                id: true,
                status: true,
                subjects: {
                  select: {
                    id: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException();
    return user.jobOnboardings;
  }

}
