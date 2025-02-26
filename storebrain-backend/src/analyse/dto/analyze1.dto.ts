import { Type } from 'class-transformer';
import { IsArray, IsDate } from 'class-validator';

export class Analyze1Dto {
  @IsArray()
  storeIds: number[];
  @IsArray()
  supplierIds: number[];
  @IsArray()
  departments: string[];
  @Type(() => Date)
  @IsDate()
  startDate: Date;
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
