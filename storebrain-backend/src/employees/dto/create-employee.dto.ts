import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsInt, IsNumber, IsString } from 'class-validator';


export class CreateEmployeeDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  companyId: number;
  @IsString()
  lastName: string;

  @IsString()
  firstName: string;

  @IsString()
  maidenName: string;

  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @IsString()
  placeOfBirth: string;

  @IsString()
  socialSecurityNumber: string;

  @IsString()
  nationality: string;

  @IsEmail()
  email: string;

  @IsString()
  cellPhone: string;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  numberOfChildren: number;

  @IsString()
  familySituation: string;

  @IsString()
  address: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  zipCode: number;

  @IsString()
  city: string;

  @Type(() => Date)
  @IsDate()
  entryDate: Date;

  @IsString()
  badgeNumber: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  jobId: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  contractId: number;

  @IsString()
  zone: string;
}
