import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateGroupMessageDto {
    @IsUUID()
    @IsNotEmpty()
    userId : string

    @IsUUID()
    @IsNotEmpty()
    groupId : string
}
