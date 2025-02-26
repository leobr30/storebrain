import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ValidateOmarDto {
    @IsString()   
    @IsNotEmpty()
    objective: string;
    @IsString()
    @IsNotEmpty()    
    tool: string;
    @IsString()    
    @IsNotEmpty()
    action: string;
    @IsDate()
    @Type(() => Date)    
    dueDate: Date;
    @IsString()
    @IsNotEmpty()
    observation: string;
    @IsDate()
    @Type(() => Date)    
    nextAppointment: Date;
}
