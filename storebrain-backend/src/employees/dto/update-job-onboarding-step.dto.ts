import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { JobOnboardingStepType } from '@prisma/client';

export class UpdateJobOnboardingStepDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    day?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    month?: number;

    @IsOptional()
    @IsEnum(JobOnboardingStepType)
    type?: JobOnboardingStepType;

    @IsOptional()
    @IsInt()
    trainingModelId?: number | null;
}
