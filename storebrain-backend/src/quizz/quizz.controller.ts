import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { SubmitQuizzAnswersDto } from './dto/submit-quizz-answers.dto';


@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createQuizzDto: CreateQuizzDto) {
    const result = await this.quizzService.createQuizz(createQuizzDto);
    return {
      message: 'Quizz créé avec succès ✅',
      data: result,
    };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const quizz = await this.quizzService.getQuizzById(id);
    return {
      message: 'Quizz récupéré avec succès ✅',
      data: quizz
    };
  }

  @Get('user/:userId')
  async getByUser(@Param('userId', ParseIntPipe) userId: number) {
    const quizzList = await this.quizzService.getQuizzByUser(userId);
    return {
      message: `Quizz pour l'utilisateur ${userId} récupérés avec succès ✅`,
      data: quizzList,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.quizzService.deleteQuizz(id);
    return {
      message: `Quizz avec l'ID ${id} supprimé avec succès 🗑️`,
      data: deleted,
    };
  }

  @Get('created-by/:userId')
  async getCreatedQuizz(@Param('userId', ParseIntPipe) userId: number) {
    return this.quizzService.getQuizzCreatedBy(userId);
  }

  @Get('assigned-to/:userId')
  async getAssignedQuizz(@Param('userId', ParseIntPipe) userId: number) {
    return this.quizzService.getQuizzAssignedTo(userId);
  }

  @Post(':id/submit')
  async submitAnswers(
    @Param('id', ParseIntPipe) quizzId: number,
    @Body() dto: SubmitQuizzAnswersDto,
  ) {
    return this.quizzService.submitAnswers(quizzId, dto);
  }

  @Get('onboarding/:quizzId')
  async getQuizzForOnboarding(@Param('quizzId', ParseIntPipe) quizzId: number) {
    return this.quizzService.getQuizzForOnboarding(quizzId);
  }
  

}
