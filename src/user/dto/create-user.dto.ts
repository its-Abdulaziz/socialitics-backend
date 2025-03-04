import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class CreateUserDto {
    
    @IsString()
    @IsNotEmpty({ message: 'User should have a unique ID' })
    firebaseUID: string;

    @IsEmail()
    @IsNotEmpty({ message: 'User should have an email' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'User should have a name' })
    name: string;

    @IsString()
    image: string;

    @IsString()
    @IsNotEmpty({ message: 'User should have a bio' })
    bio: string;
}
