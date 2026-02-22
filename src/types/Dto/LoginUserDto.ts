import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toLowerCase().trim() : value
    )
    email!: string;

    @IsString()
    @MinLength(1, { message: 'Password is required' })
    password!: string;
}
