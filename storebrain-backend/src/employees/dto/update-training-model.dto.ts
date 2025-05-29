import { IsOptional, IsString } from 'class-validator';

export class UpdateTrainingModelDto {
    @IsOptional()
    @IsString()
    tool?: string;

    @IsOptional()
    @IsString()
    exercise?: string;

    @IsOptional()
    @IsString()
    aide?: string;
}
