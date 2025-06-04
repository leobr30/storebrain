import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { SubmitQuizzAnswersDto } from './dto/submit-quizz-answers.dto';
import { EmployeesService } from 'src/employees/employees.service'; // ✅ Importation corrigée
import { MailService } from 'src/mail/mail.service';
import { PdfService } from 'src/pdf/pdf.service';
import { QuizzAnswer, QuizzQuestion } from '@prisma/client'; // ✅ Import QuizzQuestion

@Controller('quizz')
export class QuizzController {
  constructor(
    private readonly quizzService: QuizzService,
    private readonly employeeService: EmployeesService, // ✅ Nom du service corrigé
    private readonly mailService: MailService,
    private readonly pdfService: PdfService
  ) {
    console.log("✅ QuizzController chargé !");
  }

  @Post()
  async create(@Body() createQuizzDto: CreateQuizzDto) {
    console.log('📥 Requête reçue dans le controller /quizz POST');
    console.log('🧾 Données reçues :', JSON.stringify(createQuizzDto, null, 2));

    try {
      const result = await this.quizzService.createQuizz(createQuizzDto);
      console.log('✅ Quizz créé avec succès :', result);
      return {
        message: 'Quizz créé avec succès ✅',
        data: result,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création du quizz :', error);
      throw error;
    }
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
    const quizzList = await this.quizzService.getQuizzes(userId, 'all');
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
    return this.quizzService.getQuizzes(userId, 'created');
  }

  @Get('assigned-to/:userId')
  async getAssignedQuizz(@Param('userId', ParseIntPipe) userId: number) {
    return this.quizzService.getQuizzes(userId, 'assigned');
  }

  @Post(':id/submit')
  async submitAnswers(
    @Param('id', ParseIntPipe) quizzId: number,
    @Body() dto: SubmitQuizzAnswersDto,
  ) {
    console.log('📦 Payload reçu dans /submit:', dto);
    const result = await this.quizzService.submitAnswers(quizzId, dto);
    const employee = await this.employeeService.getEmployee(dto.userId);
    const quizzWithAnswers = await this.quizzService.getQuizzWithAnswers(result.quizzId, String(dto.userId));
    if (quizzWithAnswers.quizz && employee) {
      await this.generatePdfAndSendEmail(
        quizzWithAnswers.quizz.title,
        employee.name ?? "Nom Inconnu",
        employee.email ?? "gabriel.beduneau@diamantor.fr", // Use employee's email
        quizzWithAnswers.answers.map(answer => ({ question: answer.question, answer: answer.text })) // ✅ Accès à answer.text
      );
    }
    return result;
  }

  async generatePdfAndSendEmail(quizzTitle: string, employeeName: string, employeeEmail: string, answers: { question: QuizzQuestion; answer: string; }[]) {
    const pdfBuffer = await this.pdfService.generateQuizzPdf(quizzTitle, employeeName, answers);
    await this.mailService.sendQuizzResult(employeeEmail, employeeName, pdfBuffer); // Send to the employee
  }


  @Get('onboarding/:quizzId')
  async getQuizzForOnboarding(@Param('quizzId', ParseIntPipe) quizzId: number) {
    return {
      message: 'Quizz récupéré avec succès ✅',
      data: await this.quizzService.getQuizzForOnboarding(quizzId)
    };
  }

  @Get(':quizzId/answers/:userId')
  async getQuizzAnswers(
    @Param('quizzId', ParseIntPipe) quizzId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const quizzWithAnswers = await this.quizzService.getQuizzWithAnswers(quizzId, String(userId));
    return {
      quizz: quizzWithAnswers.quizz,
      answers: quizzWithAnswers.answers,
    };
  }




}
