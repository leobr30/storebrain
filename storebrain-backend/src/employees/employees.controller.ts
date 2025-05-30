import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
  ParseIntPipe,
  UploadedFiles,
} from '@nestjs/common';
import { CheckPolicies } from 'src/casl/policy.decorator';
import { PoliciesGuard } from 'src/casl/policy.guard';
import {
  CreateEmployeesPolicyHandler,
  ReadEmployeesPolicyHandler,
} from './employees.policies';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeesService } from './employees.service';

import { CurrentUser } from 'src/decorators/user.decorator';
import { CurrentUserType } from 'src/auth/dto/current-user.dto';
import { ActivateEmployeeDto } from './dto/activate-employee.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StartEmployeeIntegrationPolicyHandler } from './policies/start-integration.policy';
import { StartTrainingPolicyHandler } from './policies/start-training.policy';
import { CreateTrainingWithOnboardingDto } from './dto/create-training-with-onboarding.dto';
import { TrainingAddAttachmentDto } from './dto/training-add-attachement';
import { SaveTrainingDto } from './dto/save-training.dto';
import { LoginDto } from 'src/auth/dto/auth.dto';
import { UpdateAbsenceDto } from './dto/create-absence.dto';
import { CreateAppointmentDto } from './dto/create-monday-appointment.dto';
import { OmarDto } from './dto/save-omar.dto';
import { ValidateOmarDto } from './dto/validate-omar.dto';
import { User } from '@prisma/client';
import { PdfService } from 'src/pdf/pdf.service';
import { MailService } from 'src/mail/mail.service';
import { UpdateJobOnboardingStepDto } from './dto/update-job-onboarding-step.dto';


@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) { }


  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getEmployees(@Query('company') company?: number) {
    return await this.employeesService.getEmployees(company); // ✅ Return the result
  }

  @Get(':id/document-status')
  async getDocumentStatus(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.getEmployeeDocumentStatus(id);
  }


  @Get('employee/:id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getEmployee(@Param('id') id: number) {
    return await this.employeesService.getEmployee(id); // ✅ Return the result
  }

  @Post('upload-documents/:userId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cni', maxCount: 1 },
      { name: 'carteVitale', maxCount: 1 },
      { name: 'carteMutuelle', maxCount: 1 },
      { name: 'rib', maxCount: 1 },
      { name: 'justificatifDomicile', maxCount: 1 },
      { name: 'casierJudiciaire', maxCount: 1 },
      { name: 'titreSejour', maxCount: 1 },
    ])
  )
  async uploadEmployeeDocuments(
    @Param('userId') userId: string,
    @UploadedFiles() files: {
      cni?: Express.Multer.File[],
      carteVitale?: Express.Multer.File[],
      carteMutuelle?: Express.Multer.File[],
      rib?: Express.Multer.File[],
      justificatifDomicile?: Express.Multer.File[],
      casierJudiciaire?: Express.Multer.File[],
      titreSejour?: Express.Multer.File[],
    }
  ) {
    console.log("📦 Fichiers reçus :", Object.entries(files).map(([k, v]) => [k, v?.[0]?.originalname]));

    return this.employeesService.saveDocuments(userId, files);
  }


  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'cni', maxCount: 1 },
      { name: 'carteVitale', maxCount: 1 },
      { name: 'carteMutuelle', maxCount: 1 },
      { name: 'rib', maxCount: 1 },
      { name: 'justificatifDomicile', maxCount: 1 },
      { name: 'casierJudiciaire', maxCount: 1 },
      { name: 'titreSejour', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: 'upload/tmp',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    })
  )

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async createEmployee(
    @UploadedFiles() files: {
      file?: Express.Multer.File[],
      cni?: Express.Multer.File[],
      carteVitale?: Express.Multer.File[],
      carteMutuelle?: Express.Multer.File[],
      rib?: Express.Multer.File[],
      justificatifDomicile?: Express.Multer.File[],
      casierJudiciaire?: Express.Multer.File[],
      titreSejour?: Express.Multer.File[],
    },
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const file = files.file?.[0];
    if (!file) throw new BadRequestException("Le fichier principal est requis.");

    // Création de l'employé
    const result = await this.employeesService.createEmployee(dto, file, {
      sub: user.sub,
      name: user.name,
    });

    // Sauvegarde des autres documents (CNI, RIB, etc.)
    await this.employeesService.saveDocuments(result.id.toString(), files);

    return {
      message: "Employee created successfully",
      userId: result.id,
    };

    // ✅ Return a JSON response
  }

  @Post(':id/activate')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async activateEmployee(
    @Param('id') id: number,
    @Body() employee: ActivateEmployeeDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    await this.employeesService.activateEmployee(id, employee, user);
    return { message: "Employee activated successfully" }; // ✅ Return a JSON response
  }

  @Post(':id/check-credentials')
  async checkCredentials(
    @Param('id') userId: number,
    @Body() dto: LoginDto,
  ) {
    const checkedCredentials = await this.employeesService.checkCredentials(userId, dto);
    if (checkedCredentials) {
      return { message: "Credentials are valid" }; // ✅ Return a JSON response
    }
    throw new UnauthorizedException("Invalid credentials"); // ✅ Throw an error
  }

  @Post(':id/start-integration')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new StartEmployeeIntegrationPolicyHandler())
  async startIntegration(
    @Param('id') id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    console.log("➡️ Reçu ID:", id, "CurrentUser:", currentUser);
    await this.employeesService.startIntegration(id, currentUser);
    return { message: "Integration started successfully" }; // ✅ Return a JSON response
  }

  @Post(':id/start-training/:employeeJobIntegrationId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new StartTrainingPolicyHandler())
  async createTrainingWithEmployeeOnboardingId(
    @Param('id') userId: number,
    @Param('employeeJobIntegrationId') employeejobOnboardingId: number,
    @CurrentUser() currentUser: CurrentUserType,
    @Body('trainingModelId') trainingModelId: number | undefined,
    @Body('name') name: string,
    @Body('subjects') subjects?: { id: string; name: string; state: "ACQUIRED" | "NOT_ACQUIRED" | "IN_PROGRESS"; }[]
  ) {
    try {
      const dto = new CreateTrainingWithOnboardingDto();
      dto.userId = userId;
      dto.employeeJobOnboardId = employeejobOnboardingId;
      dto.currentUserId = currentUser.sub;
      const result = await this.employeesService.createTrainingWithEmployeeOnboardingId(
        dto,
        trainingModelId,
        name,
        subjects,
      );
      return { message: "Training created successfully", data: result };
    } catch (error) {
      console.error("Error creating training:", error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message || "Internal Server Error", error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Post(':id/absences')
  async createAbsence(
    @Param('id') userId: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const result = await this.employeesService.createAbsence(userId, currentUser);
    return { message: "Absence created successfully", data: result }; // ✅ Return a JSON response
  }

  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: 'upload/tmp',
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      },
    }),
  }))
  @Put('absences/:absenceId')
  async updateAbsence(
    @Param('absenceId') absenceId: number,
    @Body() dto: UpdateAbsenceDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const result = await this.employeesService.updateAbsence(absenceId, dto, currentUser);
    return { message: "Absence updated successfully", data: result }; // ✅ Return a JSON response
  }

  @Post('appointments')
  @UseGuards(PoliciesGuard)
  async createAppointment(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const appointment = await this.employeesService.createAppointment(dto, currentUser);
    return { message: "Appointment created successfully", data: appointment };
  }

  @Post(':id/send-summary')
  async sendSummary(
    @Param('id', ParseIntPipe) id: number,
    @Body('email') email: string,
  ) {
    const buffer = await this.pdfService.generateMondayAppointmentPdf(id);
    await this.mailService.sendMondayAppointmentMail(email, buffer, new Date());
    return { message: 'Résumé envoyé par e-mail' };
  }



  @Get('appointments/:id')
  @UseGuards(PoliciesGuard)
  async getAppointment(@Param('id') id: number) {
    return await this.employeesService.getAppointment(id);
  }

  @Get('appointments')
  @UseGuards(PoliciesGuard)
  async getAppointments() {
    return await this.employeesService.getAppointments();
  }

  @Post(':id/omar')
  @UseGuards(PoliciesGuard)

  async createOmar(
    @Param('id') userId: number,
    @CurrentUser() currentUser: CurrentUserType,
    @Query('appointmentDetailId') appointmentDetailId?: number,
  ) {
    const result = await this.employeesService.createOmar({
      createdById: currentUser.sub,
      userId,
      appointmentDetailId
    });
    return { message: "Omar created successfully", data: result };
  }

  @Put('omar/:id/save')
  @UseGuards(PoliciesGuard)
  async saveOmar(
    @Param('id') id: number,
    @Body() dto: OmarDto,
  ) {
    const result = await this.employeesService.saveOmar(id, dto);
    return { message: "Omar saved successfully", data: result }; // ✅ Return a JSON response
  }

  @Get('omar')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getAllOmars() {
    return await this.employeesService.getAllOmars();
  }


  @Get('omar/:id')
  @UseGuards(PoliciesGuard)
  async getOmar(@Param('id') id: number) {
    return await this.employeesService.getOmar(id); // ✅ Return the result
  }

  @Put('omar/:id/validate')
  @UseGuards(PoliciesGuard)
  async validateOmar(@Param('id') id: number, @Body() dto: ValidateOmarDto, @CurrentUser() currentUser: CurrentUserType) {
    const result = await this.employeesService.validateOmar(id, dto, currentUser);
    return { message: "Omar validated successfully", data: result }; // ✅ Return a JSON response
  }

  @Put('appointments/details/:id/sign')
  @UseGuards(PoliciesGuard)
  async signMondayAppointmentDetail(
    @Param('id') id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const result = await this.employeesService.signMondayAppointmentDetail(id, currentUser);
    return { message: "Appointment detail signed successfully", data: result }; // ✅ Return a JSON response
  }

  @Put('appointments/details/:id/update-remaining-days')
  async updateMondayAppointmentDetail(
    @Param('id') id: number,
    @Body() updateData: { remainingDays: string },
  ) {
    console.log("🛠️ Mise à jour reçue pour ID =", id, "→ remainingDays =", updateData.remainingDays);

    if (!updateData.remainingDays) {
      throw new BadRequestException('remainingDays is required');
    }

    const numericRemainingDays = Number(updateData.remainingDays);
    if (isNaN(numericRemainingDays)) {
      throw new BadRequestException('remainingDays must be a number');
    }

    const result = await this.employeesService.updateMondayAppointmentDetail(id, numericRemainingDays);
    return { message: "Appointment detail updated successfully", data: result };
  }


  @Get('absences/:absenceId')
  async getAbsence(
    @Param('absenceId') absenceId: number
  ) {
    return await this.employeesService.getAbsence(absenceId); // ✅ Return the result
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new BadRequestException("ID invalide");

    const result = await this.employeesService.updateEmployee(numericId, updateData);
    return { message: "Employee updated successfully", data: result };
  }

  @Post(':id/vacations')
  async createVacation(
    @Param('id') id: number,
    @Body() vacationData: { startAt: string, endAt: string },
    @CurrentUser() currentUser: CurrentUserType,
  ) {

    const result = await this.employeesService.createVacation(id, vacationData, currentUser);
    return { message: "Vacation created successfully", data: result }; // ✅ Return a JSON response
  }

  @Get(':id/vacations')
  async getEmployeeVacations(@Param('id') employeeId: number) {
    return await this.employeesService.getEmployeeVacations(employeeId); // Return the result
  }

  @Put(':id/vacations/:vacationId')
  async updateVacation(
    @Param('id') employeeId: number,
    @Param('vacationId') vacationId: number,
    @Body() vacationData: { startAt: Date; endAt: Date },
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const result = await this.employeesService.updateVacation(employeeId, vacationId, vacationData, currentUser);
    return { message: "Vacation updated successfully", data: result }; // Return a JSON response
  }

  @Patch(':employeeId/onboarding/:stepId/complete')
  async markDocumentAsCompleted(
    @Param('employeeId') employeeId: number,
    @Param('stepId') stepId: number,
    @Body('responseId') responseId: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.employeesService.markDocumentCompleted(
      employeeId,
      stepId,
      responseId,
      currentUser.sub,
    );
  }

  @Get(':id/onboarding')
  async getEmployeeOnboarding(@Param('id') id: number) {
    return this.employeesService.getEmployeeOnboarding(id);
  }

  @Get(':id/onboarding')
  async getOnboardingSteps(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.getOnboardingSteps(id);
  }

  @Post(':userId/send-unsigned-documents')
  async sendUnsignedDocuments(@Param('userId') userId: string) {
    return await this.pdfService.sendUnsignedDocumentsByEmail(userId, "gabriel.beduneau@diamantor.fr");
  }

  @Get('onboarding/steps')
  async getAllOnboardingSteps(@Query('jobOnboardingId') jobOnboardingId?: string) {
    if (jobOnboardingId) {
      const id = parseInt(jobOnboardingId);
      if (isNaN(id)) throw new BadRequestException('jobOnboardingId invalide');
      return this.employeesService.getStepsByJobOnboardingId(id);
    }

    return this.employeesService.getAllJobOnboardingSteps();
  }


  @Patch('onboarding/steps/:id')
  async updateOnboardingStep(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobOnboardingStepDto,
  ) {
    return this.employeesService.updateJobOnboardingStep(id, dto);
  }

  @Get('training-models')
  async getTrainingModels() {
    return this.employeesService.getTrainingModels();
  }


}
