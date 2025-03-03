import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class GetUserDto {
    
    @IsString()
    @IsNotEmpty({ message: 'User should have a unique ID' })
    firebaseUID: string;
}
