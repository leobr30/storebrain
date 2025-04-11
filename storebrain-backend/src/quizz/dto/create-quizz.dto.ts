import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizzAnswerDto {
    @IsString()
    @IsNotEmpty()
    text: string;
}

export class CreateQuizzQuestionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuizzAnswerDto)
    answers: CreateQuizzAnswerDto[];

    @IsOptional()
    @IsNumber()
    correctAnswerId?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}

export class CreateQuizzSectionDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuizzQuestionDto)
    questions: CreateQuizzQuestionDto[];
}

export class CreateQuizzDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    createdById: number;

    @IsNumber()
    assignedToId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuizzSectionDto)
    sections: CreateQuizzSectionDto[];

    @IsNumber()
    jobOnboardingId: number;

    
}
