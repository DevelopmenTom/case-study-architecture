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
});
