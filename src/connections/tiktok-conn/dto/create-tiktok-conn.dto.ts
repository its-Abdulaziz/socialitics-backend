import { IsNotEmpty, IsString } from "class-validator";

export class CreateTiktokConnDto {

    @IsNotEmpty()
    @IsString()
    auth_code: string;

    @IsNotEmpty()
    @IsString()
    redirect_uri: string;
}

