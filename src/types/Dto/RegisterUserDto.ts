import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegisterUserDto {
    @Expose()
    @IsEmail({}, { message: 'Invalid email format' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.toLowerCase().trim() : value
    )
    email!: string;

    @Expose()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(passwordRegex, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    unhashedPassword!: string;

    @Expose()
    @IsString()
    @MinLength(1, { message: 'First name is required' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    firstName!: string;

    @Expose()
    @IsString()
    @MinLength(1, { message: 'Last name is required' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    lastName!: string;
}
