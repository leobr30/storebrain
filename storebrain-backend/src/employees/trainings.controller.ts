// c:\Users\Gabriel\Desktop\storebrain\storebrain-backend\src\employees\trainings.controller.ts
import { Controller, UseGuards, Get, Param, HttpStatus, Put, Body, UploadedFile, UseInterceptors, Post, Delete, StreamableFile, Patch } from "@nestjs/common";
import { TrainingsService } from "./trainings.service";
import { CheckPolicies } from "src/casl/policy.decorator";
import { PoliciesGuard } from "src/casl/policy.guard";
import { StartTrainingPolicyHandler } from "./policies/start-training.policy";
import { CurrentUserType } from "src/auth/dto/current-user.dto";
import { CurrentUser } from "src/decorators/user.decorator";
import { SaveTrainingDto } from "./dto/save-training.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { TrainingAddAttachmentDto } from "./dto/training-add-attachement";
import { UpdateTrainingModelDto } from "./dto/update-training-model.dto";
import { UpdateTrainingModelSubjectDto } from "./dto/update-training-model-subject.dto";

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) { }

  // ... (autres routes) ...

  @Get('user/:id')
  async getTrainingsByUser(@Param('id') userId: number) {
    return this.trainingsService.getGeneralTrainingsByUser(userId);
  }

  @Get('user/:id/onboarding')
  async getOnboardingTrainingsByUser(@Param('id') userId: number) {
    return this.trainingsService.getOnboardingTrainingsByUser(userId);
  }

  @Get('user/:id/all')
  async getAllTrainingsByUser(@Param('id') userId: number) {
    const general = await this.trainingsService.getGeneralTrainingsByUser(userId);
    const onboarding = await this.trainingsService.getOnboardingTrainingsByUser(userId);
    return {
      general,
      onboarding,
      all: [...general, ...onboarding]
    };
  }

  @Get('training-models')
  async getTrainingModels() {
    return this.trainingsService.getTrainingModels();
  }

  @Get('/:trainingId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new StartTrainingPolicyHandler())
  async getTraining(
    @Param('trainingId') trainingId: number,
  ) {
    return await this.trainingsService.getTraining(trainingId);
  }


  @Put(':trainingId/save')
  async saveTraining(
    @Param('trainingId') trainingId: number,
    @Body() dto: SaveTrainingDto,
  ) {
    await this.trainingsService.saveTraining(
      trainingId,
      dto,
    );
    return HttpStatus.OK;
  }


  @Post(':trainingId/:trainingSubjectId/add-attachment')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new StartTrainingPolicyHandler())
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
  async trainingAddAttachment(
    @Param('trainingId') trainingId: number,
    @Param('trainingSubjectId') trainingSubjectId: number,
    @Body() dto: TrainingAddAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const trainingSubjectFileId =
      await this.trainingsService.trainingAddAttachment({
        trainingId,
        trainingSubjectId,
        file,
        fileName: dto.fileName,
      });
    return trainingSubjectFileId;
  }




  @Put(':trainingId/validate')
  async validateTraining(
    @Param('trainingId') trainingId: number,
    @Body() dto: SaveTrainingDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    await this.trainingsService.closeTraining(
      trainingId,
      currentUser,
      dto,
    );
    return HttpStatus.OK;
  }

  @Delete(':trainingId/delete-attachment/:attachmentId')
  async deleteAttachment(
    @Param('trainingId') trainingId: number,
    @Param('attachmentId') attachmentId: number,
  ) {
    await this.trainingsService.deleteAttachment(trainingId, attachmentId);
    return HttpStatus.OK;
  }

  @Get(':trainingId/download-attachment/:attachmentId')
  async downloadAttachment(
    @Param('trainingId') trainingId: number,
    @Param('attachmentId') attachmentId: number,
  ) {

    const file = await this.trainingsService.downloadAttachment(trainingId, attachmentId);
    return new StreamableFile(file.file, {
      type: 'application/octet-stream',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Patch('/training-model/:id')
  async updateTrainingModel(
    @Param('id') id: number,
    @Body() dto: UpdateTrainingModelDto
  ) {
    return this.trainingsService.updateTrainingModel(id, dto);
  }

  @Patch('/training-model-subject/:id')
  async updateTrainingModelSubject(
    @Param('id') id: number,
    @Body() dto: UpdateTrainingModelSubjectDto
  ) {
    console.log("🛠 updateTrainingModelSubject", id, dto);
    return this.trainingsService.updateTrainingModelSubject(id, dto);
  }

  @Post('training-models/:id/subjects')
  createTrainingModelSubject(
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    const modelId = parseInt(id, 10);
    return this.trainingsService.createTrainingModelSubject(modelId, name);
  }

  @Delete('training-models/subjects/:subjectId')
  async deleteTrainingModelSubject(@Param('subjectId') subjectId: string) {
    const id = parseInt(subjectId, 10);
    return this.trainingsService.deleteTrainingModelSubject(id);
  }






}
