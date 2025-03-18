import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class CreateTwitterConnDto {

    @IsString()
    @IsNotEmpty({ message: 'send auth_code' })
    auth_code: string;

    @IsString()
    @IsNotEmpty({ message: 'send redirect_uri' })
    redirect_uri: string;}
