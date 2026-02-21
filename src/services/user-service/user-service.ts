import { UserService } from '../../types/services/UserService';
import { inject, injectable } from 'inversify';
import { DISymbols } from '../../lib';
import { UserRepository } from '../../types/repositories/UserRepository';
import { RegisterUserDto } from '../../types/Dto/RegisterUserDto';
import { User } from '../../entities';
import { PasswordManagerService } from '../../types/services/PasswordManagerService';
import { AuthService } from '../../types/services/AuthService';
import { UserRoles } from '../../types/enums';

@injectable()
export class UserServiceImpl implements UserService {
    constructor(
        @inject(DISymbols.UserRepository)
        private userRepository: UserRepository,
        @inject(DISymbols.PasswordManagerService)
        private passwordManagerService: PasswordManagerService,
        @inject(DISymbols.AuthService)
        private authService: AuthService
    ) {}

    async register(userData: RegisterUserDto): Promise<User> {
        const { unhashedPassword, ...rest } = userData;
        const password = await this.passwordManagerService.toHash(
            unhashedPassword
        );
        return this.userRepository.create({ ...rest, password });
    }

    async authenticate(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.passwordManagerService.compare({
            storedPassword: user.password,
            suppliedPassword: password,
        });

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return this.authService.generateToken({
            userId: user.id,
            role: UserRoles.USER,
        });
    }
}
