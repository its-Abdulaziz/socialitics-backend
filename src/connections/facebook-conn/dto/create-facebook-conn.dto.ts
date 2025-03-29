import { IsNotEmpty, IsString } from 'class-validator';
export class CreateFacebookConnDto {

    @IsNotEmpty()
    @IsString()
    auth_code: string;

    @IsNotEmpty()
    @IsString()
    redirect_uri: string;

    
}
