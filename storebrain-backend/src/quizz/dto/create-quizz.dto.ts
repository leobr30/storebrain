import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizzQuestionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

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
    employeeId: number;


    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuizzSectionDto)
    sections: CreateQuizzSectionDto[];

    @IsNumber()
    jobOnboardingId: number;
}
