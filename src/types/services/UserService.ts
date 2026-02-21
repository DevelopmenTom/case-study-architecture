import { User } from '../../entities';
import { RegisterUserDto } from '../Dto/RegisterUserDto';

export interface UserService {
    register(userData: RegisterUserDto): Promise<User>;
    authenticate(email: string, password: string): Promise<string>;
}
