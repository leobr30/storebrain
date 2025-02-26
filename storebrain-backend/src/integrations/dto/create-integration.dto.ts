import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateIntegrationDto {
  @IsInt()
  jobId: number;

  @IsArray()
  steps: CreateIntegrationStepDto[];
}

export class CreateIntegrationStepDto {
  @IsInt()
  day: number;
  @IsString()
  name: string;
  @IsArray()
  subjects: CreateIntegrationStepSubjectDto[];
  @IsString()
  tool: string;
}

export class CreateIntegrationStepSubjectDto {
  @IsString()
  name: string;
}