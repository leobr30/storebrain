import { State } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

export class SaveTrainingDto {
  @IsString()
  comment: string;

  @IsString()
  tool: string;
  @IsString()
  exercise: string;

  @IsArray()
  subjects: SaveTrainingSubjectDto[];
}

class SaveTrainingSubjectDto {
  @IsNumber()
  subjectId: number;
  @IsEnum(State)
  assessment: State;
}
