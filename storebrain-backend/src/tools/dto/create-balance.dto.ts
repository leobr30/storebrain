import { IsArray } from "class-validator";

export class CreateBalanceDto {
    @IsArray()
    departments: string[];
    @IsArray()
    senderStoreIds: number[];
    @IsArray()
    receiverStoreIds: number[];
}
