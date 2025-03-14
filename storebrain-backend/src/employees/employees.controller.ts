import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
    return await this.employeesService.getEmployees(company);
  }

  @Get('employee/:id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadEmployeesPolicyHandler())
  async getEmployee(@Param('id') id: number) {
    return await this.employeesService.getEmployee(id);
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
    await this.employeesService.createEmployee(dto, file, {
      sub: user.sub,
      name: user.name,
    });
    return HttpStatus.OK;
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
    return HttpStatus.OK;
  }

  @Post(':id/check-credentials')
  async checkCredentials(
    @Param('id') userId: number,
    @Body() dto: LoginDto,
  ) {
    const checkedCredentials = await this.employeesService.checkCredentials(userId, dto);
    if (checkedCredentials) {
      return HttpStatus.OK;
    }
    return HttpStatus.UNAUTHORIZED;
  }

  @Post(':id/start-integration')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new StartEmployeeIntegrationPolicyHandler())
  async startIntegration(
    @Param('id') id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    await this.employeesService.startIntegration(id, currentUser);
    return HttpStatus.OK;
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
    return await this.employeesService.createTrainingWithEmployeeOnboardingId(
      dto,
    );
  }



  // @UseInterceptors(FileInterceptor('file', {
  //   storage: diskStorage({
  //     destination: 'upload/tmp',
  //     filename: (req, file, cb) => {
  //       cb(null, Date.now() + '-' + file.originalname);
  //     },
  //   }),
  // }))

  // @Post(':id/absences')
  // async createAbsence(
  //   @Param('id') userId: number,
  //   @Body() dto: CreateOrUpdateAbsenceDto,
  //   @CurrentUser() currentUser: CurrentUserType,
  //   @UploadedFile() file?: Express.Multer.File,
  // ) {
  //   return await this.employeesService.createAbsence(userId,currentUser, dto, file);
  // }

  @Post(':id/absences')
  async createAbsence(
    @Param('id') userId: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.employeesService.createAbsence(userId, currentUser);
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
    return await this.employeesService.updateAbsence(absenceId, dto, currentUser);
  }

  @Post('appointments')
  @UseGuards(PoliciesGuard)
  async createAppointment(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const appointment = await this.employeesService.createAppointment(dto, currentUser);
    return appointment;
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
    const omar = await this.employeesService.createOmar({
      createdById: currentUser.sub,
      userId,
      appointmentDetailId
    });
    return omar;
  }

  @Put('omar/:id/save')
  @UseGuards(PoliciesGuard)
  async saveOmar(
    @Param('id') id: number,
    @Body() dto: OmarDto,
  ) {
    return await this.employeesService.saveOmar(id, dto);
  }

  @Get('omar/:id')
  @UseGuards(PoliciesGuard)
  async getOmar(@Param('id') id: number) {
    return await this.employeesService.getOmar(id);
  }

  @Put('omar/:id/validate')
  @UseGuards(PoliciesGuard)
  async validateOmar(@Param('id') id: number, @Body() dto: ValidateOmarDto, @CurrentUser() currentUser: CurrentUserType) {
    return await this.employeesService.validateOmar(id, dto, currentUser);
  }

  @Put('appointments/details/:id/sign')
  @UseGuards(PoliciesGuard)
  async signMondayAppointmentDetail(
    @Param('id') id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return await this.employeesService.signMondayAppointmentDetail(id, currentUser);
  }

  @Get('absences/:absenceId')
  async getAbsence(
    @Param('absenceId') absenceId: number
  ) {
    return await this.employeesService.getAbsence(absenceId);
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new BadRequestException("ID invalide");

    return await this.employeesService.updateEmployee(numericId, updateData);
  }

  @Post(':id/vacations')
  async createVacation(@Param('id') id: number, @Body() vacationData: { startAt: string, endAt: string }) {
    return await this.employeesService.createVacation(id, vacationData);
  }

  @Get(':id/vacations')
  async getEmployeeVacations(@Param('id') employeeId: number) {
    return await this.employeesService.getEmployeeVacations(employeeId);
  }

  @Put(':id/vacations/:vacationId')
  async updateVacation(
    @Param('id') employeeId: number,
    @Param('vacationId') vacationId: number,
    @Body() vacationData: { startAt: Date; endAt: Date },
    @CurrentUser() currentUser: CurrentUserType
  ) {
    return this.employeesService.updateVacation(employeeId, vacationId, vacationData, currentUser);
  }



}
