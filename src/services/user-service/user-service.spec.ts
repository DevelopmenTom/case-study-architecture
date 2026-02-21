import {
    diContainer,
    initializeDataSourceInContainer,
} from '../../../inversify.config';
import { DISymbols } from '../../lib';
import { mockUserData } from '../../testHelpers/mockUserData';
import { randomUUID } from 'crypto';
import { UserService } from '../../types/services';
import { User } from '../../entities';

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

    describe('getProfile', () => {
        it('should return user profile with email, firstName, and lastName', async () => {
            const { password: unhashedPassword, ...rest } = mockUserData();

            const user = await userService.register({
                unhashedPassword,
                ...rest,
            });

            const profile = await userService.getProfile(user.id);

            expect(profile).toEqual({
                email: rest.email,
                firstName: rest.firstName,
                lastName: rest.lastName,
            });
        });

        it('should throw an error when user does not exist', async () => {
            await expect(userService.getProfile(randomUUID())).rejects.toThrow(
                'User not found'
            );
        });
    });

    describe('updateProfile', () => {
        let user: User;

        beforeEach(async () => {
            const { password: unhashedPassword, ...rest } = mockUserData();

            user = await userService.register({
                unhashedPassword,
                ...rest,
            });
        });

        it('should update and return user profile', async () => {
            const updatedProfile = await userService.updateProfile(user.id, {
                firstName: 'UpdatedFirstName',
                lastName: 'UpdatedLastName',
            });

            expect(updatedProfile).toEqual({
                email: user.email,
                firstName: 'UpdatedFirstName',
                lastName: 'UpdatedLastName',
            });
        });

        it('should update only firstName when lastName is not provided', async () => {
            const updatedProfile = await userService.updateProfile(user.id, {
                firstName: 'NewFirstName',
            });

            expect(updatedProfile).toEqual({
                email: user.email,
                firstName: 'NewFirstName',
                lastName: user.lastName,
            });
        });

        it('should update only lastName when firstName is not provided', async () => {
            const updatedProfile = await userService.updateProfile(user.id, {
                lastName: 'NewLastName',
            });

            expect(updatedProfile).toEqual({
                email: user.email,
                firstName: user.firstName,
                lastName: 'NewLastName',
            });
        });
    });
});
