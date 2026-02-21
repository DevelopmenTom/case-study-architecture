import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities';
import { TYPES } from '../lib';

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
}

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(userData: CreateUserDto): Promise<User>;
    update(id: string, userData: UpdateUserDto): Promise<User>;
}

@injectable()
export class UserRepositoryImpl implements UserRepository {
    private repository: Repository<User>;

    constructor(@inject(TYPES.DB) dataSource: DataSource) {
        this.repository = dataSource.getRepository(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({ where: { id } });
    }

    async create(userData: CreateUserDto): Promise<User> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async update(id: string, userData: UpdateUserDto): Promise<User> {
        await this.repository.update(id, userData);
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new Error('User not found after update');
        }
        return updatedUser;
    }
}
