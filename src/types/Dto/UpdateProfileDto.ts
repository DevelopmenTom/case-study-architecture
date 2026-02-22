import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @Expose()
    @IsUUID('4', { message: 'Invalid user ID format' })
    userId!: string;

    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(1)
    firstName?: string;

    @Expose()
    @IsOptional()
    @IsString()
    @MinLength(1)
    lastName?: string;
}
