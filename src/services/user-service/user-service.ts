import { inject, injectable } from 'inversify';

import { User } from '../../entities';
import { DISymbols } from '../../lib';
import {
    RegisterUserDto,
    UpdateProfileDto,
    UserProfileDto,
} from '../../types/Dto';
import { HttpError } from '../../types/errors';
import { UserRepository } from '../../types/repositories';
import {
    AuthService,
    PasswordManagerService,
    UserService,
} from '../../types/services';

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
            throw new HttpError('Invalid credentials', 400);
        }

        const isPasswordValid = await this.passwordManagerService.compare({
            storedPassword: user.password,
            suppliedPassword: password,
        });

        if (!isPasswordValid) {
            throw new HttpError('Invalid credentials', 400);
        }

        return this.authService.generateToken({
            userId: user.id,
        });
    }

    async getProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new HttpError('User not found', 404);
        }

        return {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }

    async updateProfile(
        userId: string,
        updateData: Omit<UpdateProfileDto, 'userId'>
    ): Promise<UserProfileDto> {
        if (Object.keys(updateData).length === 0) {
            throw new HttpError('No fields to update', 400);
        }

        const updatedUser = await this.userRepository.update(
            userId,
            updateData
        );

        if (!updatedUser) {
            throw new HttpError('User not found', 404);
        }

        return {
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
        };
    }
}
