import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInstagramConnDto {

    @IsNotEmpty()
    @IsString()
    auth_code: string;

    @IsNotEmpty()
    @IsString()
    redirect_uri: string;
}
