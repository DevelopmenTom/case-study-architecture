import { randomUUID } from 'crypto';

import { User } from '../../entities';
import { RegisterUserDto, UpdateProfileDto } from '../../types/Dto';
import { UserRoles } from '../../types/enums';
import { UserRepository } from '../../types/repositories';
import { AuthService, PasswordManagerService } from '../../types/services';

import { UserServiceImpl } from './user-service';

describe('UserService (unit tests)', () => {
    let userService: UserServiceImpl;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockPasswordManagerService: jest.Mocked<PasswordManagerService>;
    let mockAuthService: jest.Mocked<AuthService>;

    beforeEach(() => {
        mockUserRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        } as any;

        mockPasswordManagerService = {
            toHash: jest.fn(),
            compare: jest.fn(),
        } as any;

        mockAuthService = {
            generateToken: jest.fn(),
            verify: jest.fn(),
        } as any;

        userService = new UserServiceImpl(
            mockUserRepository,
            mockPasswordManagerService,
            mockAuthService
        );
    });

    describe('register', () => {
        it('should hash password and create user', async () => {
            const registerDto: RegisterUserDto = {
                email: 'test@example.com',
                unhashedPassword: 'plainPassword123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const hashedPassword = 'hashedPassword123';
            const createdUser = {
                id: randomUUID(),
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
            } as User;

            mockPasswordManagerService.toHash.mockResolvedValue(hashedPassword);
            mockUserRepository.create.mockResolvedValue(createdUser);

            const result = await userService.register(registerDto);

            expect(mockPasswordManagerService.toHash).toHaveBeenCalledWith(
                registerDto.unhashedPassword
            );
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
            });
            expect(result).toEqual(createdUser);
        });
    });

    describe('authenticate', () => {
        it('should return JWT token when credentials are valid', async () => {
            const email = 'test@example.com';
            const password = 'plainPassword';
            const mockUser = {
                id: randomUUID(),
                email,
                password: 'hashedPassword',
                firstName: 'John',
                lastName: 'Doe',
            } as User;
            const mockToken = 'jwt-token-123';

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockPasswordManagerService.compare.mockResolvedValue(true);
            mockAuthService.generateToken.mockReturnValue(mockToken);

            const result = await userService.authenticate(email, password);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockPasswordManagerService.compare).toHaveBeenCalledWith({
                storedPassword: mockUser.password,
                suppliedPassword: password,
            });
            expect(mockAuthService.generateToken).toHaveBeenCalledWith({
                userId: mockUser.id,
                role: UserRoles.USER,
            });
            expect(result).toBe(mockToken);
        });

        it('should throw error when email does not exist', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(
                userService.authenticate('nonexistent@example.com', 'password')
            ).rejects.toThrow('Invalid credentials');

            expect(mockPasswordManagerService.compare).not.toHaveBeenCalled();
            expect(mockAuthService.generateToken).not.toHaveBeenCalled();
        });

        it('should throw error when password is incorrect', async () => {
            const mockUser = {
                id: randomUUID(),
                email: 'test@example.com',
                password: 'hashedPassword',
            } as User;

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockPasswordManagerService.compare.mockResolvedValue(false);

            await expect(
                userService.authenticate('test@example.com', 'wrongPassword')
            ).rejects.toThrow('Invalid credentials');

            expect(mockAuthService.generateToken).not.toHaveBeenCalled();
        });

        it('should throw error with statusCode 400 for invalid credentials', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            try {
                await userService.authenticate('test@example.com', 'password');
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe('Invalid credentials');
                expect(error.statusCode).toBe(400);
            }
        });
    });

    describe('getProfile', () => {
        it('should return user profile when user exists', async () => {
            const userId = randomUUID();
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
            } as User;

            mockUserRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.getProfile(userId);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                email: mockUser.email,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
            });
        });

        it('should throw error when user does not exist', async () => {
            const userId = randomUUID();
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(userService.getProfile(userId)).rejects.toThrow(
                'User not found'
            );
        });
    });

    describe('updateProfile', () => {
        it('should update and return user profile', async () => {
            const userId = randomUUID();
            const updateDto: UpdateProfileDto = {
                firstName: 'UpdatedFirstName',
                lastName: 'UpdatedLastName',
            };
            const updatedUser = {
                id: userId,
                email: 'test@example.com',
                firstName: updateDto.firstName,
                lastName: updateDto.lastName,
                password: 'hashedPassword',
            } as User;

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile(userId, updateDto);

            expect(mockUserRepository.update).toHaveBeenCalledWith(
                userId,
                updateDto
            );
            expect(result).toEqual({
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            });
        });

        it('should update only firstName when lastName is not provided', async () => {
            const userId = randomUUID();
            const updateDto: UpdateProfileDto = {
                firstName: 'NewFirstName',
            };
            const updatedUser = {
                id: userId,
                email: 'test@example.com',
                firstName: updateDto.firstName,
                lastName: 'OriginalLastName',
                password: 'hashedPassword',
            } as User;

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile(userId, updateDto);

            expect(mockUserRepository.update).toHaveBeenCalledWith(
                userId,
                updateDto
            );
            expect(result).toEqual({
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            });
        });

        it('should update only lastName when firstName is not provided', async () => {
            const userId = randomUUID();
            const updateDto: UpdateProfileDto = {
                lastName: 'NewLastName',
            };
            const updatedUser = {
                id: userId,
                email: 'test@example.com',
                firstName: 'OriginalFirstName',
                lastName: updateDto.lastName,
                password: 'hashedPassword',
            } as User;

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile(userId, updateDto);

            expect(mockUserRepository.update).toHaveBeenCalledWith(
                userId,
                updateDto
            );
            expect(result).toEqual({
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            });
        });
    });
});
