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
  UnauthorizedException
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
import { FileInterceptor } from '@nestjs/platform-express';
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
import { User } from '@prisma/client'; // ✅ Ajoute cet import


@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) { }


  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getEmployees(@Query('company') company?: number) {
    return await this.employeesService.getEmployees(company); // ✅ Return the result
  }

  @Get('employee/:id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getEmployee(@Param('id') id: number) {
    return await this.employeesService.getEmployee(id); // ✅ Return the result
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'upload/tmp',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateEmployeesPolicyHandler())
  async createEmployee(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const result = await this.employeesService.createEmployee(dto, file, {
      sub: user.sub,
      name: user.name,
    });
    return { message: "Employee created successfully", data: result }; // ✅ Return a JSON response
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
  ) {
    const dto = new CreateTrainingWithOnboardingDto();
    dto.userId = userId;
    dto.employeeJobOnboardId = employeejobOnboardingId;
    dto.currentUserId = currentUser.sub;
    const result = await this.employeesService.createTrainingWithEmployeeOnboardingId(
      dto,
    );
    return { message: "Training created successfully", data: result }; // ✅ Return a JSON response
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
    return { message: "Appointment created successfully", data: appointment }; // ✅ Return a JSON response
  }

  @Get('appointments/:id')
  @UseGuards(PoliciesGuard)

  async getAppointment(@Param('id') id: number) {
    return await this.employeesService.getAppointment(id); // ✅ Return the result
  }

  @Get('appointments')
  @UseGuards(PoliciesGuard)
  async getAppointments() {
    return await this.employeesService.getAppointments(); // ✅ Return the result
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
    return { message: "Omar created successfully", data: result }; // ✅ Return a JSON response
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
    return { message: "Employee updated successfully", data: result }; // ✅ Return a JSON response
  }

  @Post(':id/vacations')
  async createVacation(@Param('id') id: number, @Body() vacationData: { startAt: string, endAt: string }) {
    const result = await this.employeesService.createVacation(id, vacationData);
    return { message: "Vacation created successfully", data: result }; // ✅ Return a JSON response
  }

  @Get(':id/vacations')
  async getEmployeeVacations(@Param('id') employeeId: number) {
    return await this.employeesService.getEmployeeVacations(employeeId); // ✅ Return the result
  }

  @Put(':id/vacations/:vacationId')
  async updateVacation(
    @Param('id') employeeId: number,
    @Param('vacationId') vacationId: number,
    @Body() vacationData: { startAt: Date; endAt: Date },
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const result = await this.employeesService.updateVacation(employeeId, vacationId, vacationData, currentUser);
    return { message: "Vacation updated successfully", data: result }; // ✅ Return a JSON response
  }

  @Patch(':employeeId/onboarding/:stepId/complete')
  async markDocumentAsCompleted(@Param('employeeId') employeeId: number, @Param('stepId') stepId: number) {
    const result = await this.employeesService.markDocumentCompleted(employeeId, stepId);
    return { message: "Document marked as completed", data: result };
  }
}
