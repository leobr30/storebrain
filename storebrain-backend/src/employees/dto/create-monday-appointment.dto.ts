import { IsDate, IsEnum, IsNumber } from 'class-validator';
import { Status } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @Type(() => Date)
  @IsDate()
  date: Date;
  
  @IsNumber()
  companyId: number;
}