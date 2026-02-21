import { CreateUserDto } from '../types/Dto/CreateUserDto';

export const mockUserData = (): CreateUserDto => {
    return {
        email: `test-${Date.now()}@example.com`,
        password: 'passwordMock',
        firstName: 'John',
        lastName: 'Doe',
    };
};
