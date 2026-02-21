import {
    diContainer,
    initializeDataSourceInContainer,
} from '../../../inversify.config';
import { UserService } from '../../types/services/UserService';
import { DISymbols } from '../../lib';
import { mockUserData } from '../../testHelpers/mockUserData';

describe('UserService', () => {
    let userService: UserService;

    beforeAll(async () => {
        await initializeDataSourceInContainer();
        userService = diContainer.get<UserService>(DISymbols.UserService);
    });

    describe('register', () => {
        it('should return a new user with hashed password that is unequal to user input (unhashedPassword)', async () => {
            const { password: unhashedPassword, ...rest } = mockUserData();

            const res = await userService.register({
                unhashedPassword,
                ...rest,
            });

            expect(res.password).not.toEqual(unhashedPassword);
        });
    });

    describe('authenticate', () => {
        it('should return a JWT token when credentials are valid', async () => {
            const { password: unhashedPassword, ...rest } = mockUserData();

            await userService.register({
                unhashedPassword,
                ...rest,
            });

            const token = await userService.authenticate(
                rest.email,
                unhashedPassword
            );

            expect(typeof token).toBe('string');
        });

        it('should throw an error when email does not exist', async () => {
            await expect(
                userService.authenticate(
                    'nonexistent@example.com',
                    'anyPassword'
                )
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw an error when password is incorrect', async () => {
            const { password: unhashedPassword, ...rest } = mockUserData();

            await userService.register({
                unhashedPassword,
                ...rest,
            });

            await expect(
                userService.authenticate(rest.email, 'wrongPassword')
            ).rejects.toThrow('Invalid credentials');
        });
    });
});
