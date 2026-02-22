import { IsUUID } from 'class-validator';

export class GetProfileDto {
    @IsUUID('4', { message: 'Invalid user ID format' })
    userId!: string;
}
