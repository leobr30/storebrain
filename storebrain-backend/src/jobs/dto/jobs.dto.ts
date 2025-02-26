import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateOrEditJobDto {
  @IsString()
  name: string;
  @IsString()
  qualification: string;
  @IsArray()
  contracts: ContractDto[];
}

export class ContractDto {
  @IsString()
  type: string;
  @IsNumber()
  workingHoursPerWeek: number;
  @IsNumber()
  lengthOfTrialPeriod: number;
}
