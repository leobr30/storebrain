// src/quizz/dto/submit-quizz-answers.dto.ts
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizzAnswerPayload {
    @IsNumber()
    questionId: number;

    @IsString()
    answer: string;
}

export class SubmitQuizzAnswersDto {
    @IsNumber()
    userId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizzAnswerPayload)
    answers: QuizzAnswerPayload[];
}
