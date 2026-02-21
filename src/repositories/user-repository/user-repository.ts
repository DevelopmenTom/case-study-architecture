import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../entities';
import { DISymbols } from '../../lib';
import { CreateUserDto } from 'types/Dto/CreateUserDto';
import { UpdateUserDto } from '../../types/Dto/UpdateUserDto';
import { UserRepository } from '../../types/repositories/UserRepository';

@injectable()
export class UserRepositoryImpl implements UserRepository {
    private repository: Repository<User>;

    constructor(@inject(DISymbols.DB) dataSource: DataSource) {
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
