import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateEmployeePdfDto {
  @IsNumber()
  userId:number;
  @IsNumber()
  companyNumber: number;
  @IsString()
  companyName: string;
  @IsString()
  lastName: string;
  @IsString()
  firstName: string;
  @IsNumber()
  maidenName: string;
  @IsString()
  dateOfBirth: string;
  @IsString()
  placeOfBirth: string;
  @IsString()
  socialSecurityNumber: string;
  @IsString()
  nationality: string;
  @IsString()
  address: string;
  @IsNumber()
  zipCode: number;
  @IsString()
  city: string;
  @IsEmail()
  email: string;
  @IsString()
  cellPhone: string;
  @IsString()
  familySituation: string;
  @IsNumber()
  numberOfChildren: number;
  @IsString()
  entryDate: string;
  @IsString()
  bagdeNumber: string;
  @IsString()
  job: string;
  @IsString()
  contract: string;
  @IsString()
  zone: string;
  @IsString()
  endDate: string;
  @IsString()
  createdBy: string;
  @IsNumber()
  createdById: number;
  @IsString()
  createdAt: string;

  file: Express.Multer.File;
}
