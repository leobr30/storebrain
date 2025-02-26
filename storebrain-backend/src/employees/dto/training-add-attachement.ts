import { IsString } from 'class-validator';

export class TrainingAddAttachmentDto {
  @IsString()
  fileName: string;
}
