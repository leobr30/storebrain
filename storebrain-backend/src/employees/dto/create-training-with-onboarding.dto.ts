import { IsInt } from 'class-validator';

export class CreateTrainingWithOnboardingDto {
  @IsInt()
  userId: number;
  @IsInt()
  employeeJobOnboardId: number;
  @IsInt()
  currentUserId: number;
}
