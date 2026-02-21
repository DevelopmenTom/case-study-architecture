import { CreateUserDto } from '../repositories';

export const mockUserData = (): CreateUserDto => {
    return {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
    };
};
