import { UserService } from '../../types/services/UserService';
import { inject, injectable } from 'inversify';
import { DISymbols } from '../../lib';
import { UserRepository } from '../../types/repositories/UserRepository';
import { RegisterUserDto } from '../../types/Dto/RegisterUserDto';
import { User } from '../../entities';
import { PasswordManagerService } from '../../types/services/PasswordManagerService';

@injectable()
export class UserServiceImpl implements UserService {
    constructor(
        @inject(DISymbols.UserRepository)
        private userRepository: UserRepository,
        @inject(DISymbols.PasswordManagerService)
        private passwordManagerService: PasswordManagerService
    ) {}

    async register(userData: RegisterUserDto): Promise<User> {
        const { unhashedPassword, ...rest } = userData;
        const password = await this.passwordManagerService.toHash(
            unhashedPassword
        );
        return this.userRepository.create({ ...rest, password });
    }
}
