import { IsNumber, IsString } from 'class-validator';

export class CurrentUserType {
  @IsNumber()
  sub: number;
  @IsString()
  name: string;
}
