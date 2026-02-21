import { User } from '../../entities';
import { CreateUserDto } from '../Dto/CreateUserDto';
import { UpdateUserDto } from '../Dto/UpdateUserDto';

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(userData: CreateUserDto): Promise<User>;
    update(id: string, userData: UpdateUserDto): Promise<User>;
}
