import { User } from '../../entities';
import { RegisterUserDto, UserProfileDto, UpdateProfileDto } from '../Dto';

export interface UserService {
    register(userData: RegisterUserDto): Promise<User>;
    authenticate(email: string, password: string): Promise<string>;
    getProfile(userId: string): Promise<UserProfileDto>;
    updateProfile(
        userId: string,
        data: UpdateProfileDto
    ): Promise<UserProfileDto>;
}
