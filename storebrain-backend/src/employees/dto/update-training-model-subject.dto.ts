import { IsString } from 'class-validator';

export class UpdateTrainingModelSubjectDto {
    @IsString()
    name: string;

    @IsString()
    aide: string;
}
