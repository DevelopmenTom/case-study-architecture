import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsUUID('4', { message: 'Invalid user ID format' })
    userId!: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    lastName?: string;
}
