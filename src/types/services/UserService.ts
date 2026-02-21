import { User } from '../../entities';
import { RegisterUserDto } from '../Dto/RegisterUserDto';
import { UserProfileDto } from '../Dto/UserProfileDto';

export interface UserService {
    register(userData: RegisterUserDto): Promise<User>;
    authenticate(email: string, password: string): Promise<string>;
    getProfile(userId: string): Promise<UserProfileDto>;
}
