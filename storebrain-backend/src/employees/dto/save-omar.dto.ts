import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class OmarDto {
    @IsString()    
    objective: string;
    @IsString()    
    tool: string;
    @IsString()    
    action: string;
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dueDate: Date;
    @IsString()
    observation: string;
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    nextAppointment: Date;
}
