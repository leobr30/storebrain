import { IsString } from 'class-validator';

export class ActivateEmployeeDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}
