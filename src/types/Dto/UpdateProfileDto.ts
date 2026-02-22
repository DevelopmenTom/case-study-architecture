import { Expose, Transform } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateProfileDto {
    @Expose()
    @IsUUID('4', { message: 'Invalid user ID format' })
    userId!: string;

    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(20, { message: 'First name too long' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    firstName?: string;

    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(20, { message: 'Last name too long' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    lastName?: string;
}
