import { UserAbsenceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateAbsenceDto {
    @Type(() => Date)
    @IsDate()
    startAt: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endAt: Date;

    @IsEnum(UserAbsenceType)
    type: UserAbsenceType;

    @ValidateIf(o => o.type === UserAbsenceType.MEDICAL)
    @Type(() => Date)
    @IsDate()
    sicknessStartDate: Date;

    @ValidateIf(o => o.type === UserAbsenceType.MEDICAL)
    @Type(() => Date)
    @IsDate()
    sicknessEndDate: Date;

    @ValidateIf(o => o.type === UserAbsenceType.DEATH)
    @IsString()    
    familyRelationShip: string;

    @ValidateIf(o => o.type === UserAbsenceType.ACCIDENT_AT_WORK || o.type === UserAbsenceType.TRANSPORT_ACCIDENT)
    @Type(() => Date)
    @IsDate()
    timeOfAccident: Date;

    @ValidateIf(o => o.type === UserAbsenceType.ACCIDENT_AT_WORK || o.type === UserAbsenceType.TRANSPORT_ACCIDENT)
    @Type(() => Date)
    @IsDate()
    schedule: Date;

    @ValidateIf(o => o.type === UserAbsenceType.ACCIDENT_AT_WORK || o.type === UserAbsenceType.TRANSPORT_ACCIDENT)
    @IsString()
    placeOfAccident: string;

    @ValidateIf(o => o.type === UserAbsenceType.ACCIDENT_AT_WORK || o.type === UserAbsenceType.TRANSPORT_ACCIDENT)
    @IsString()
    circumstances: string;

    @ValidateIf(o => o.type === UserAbsenceType.ACCIDENT_AT_WORK || o.type === UserAbsenceType.TRANSPORT_ACCIDENT)
    @IsString()
    injuries: string;
    
}

