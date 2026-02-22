import { randomUUID } from 'crypto';

import { DataSource, Repository } from 'typeorm';

import { User } from '../../entities';
import { CreateUserDto, UpdateUserDto } from '../../types/Dto';

import { UserRepositoryImpl } from './user-repository';

describe('UserRepository (unit tests)', () => {
    let userRepository: UserRepositoryImpl;
    let mockRepository: jest.Mocked<Repository<User>>;
    let mockDataSource: jest.Mocked<DataSource>;

    beforeEach(() => {
        mockRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        } as any;

        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockRepository),
        } as any;

        userRepository = new UserRepositoryImpl(mockDataSource);
    });

    describe('findByEmail', () => {
        it('should call repository.findOne with correct parameters', async () => {
            const email = 'test@example.com';
            const mockUser = {
                id: randomUUID(),
                email,
                firstName: 'John',
                lastName: 'Doe',
            } as User;

            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await userRepository.findByEmail(email);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email },
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await userRepository.findByEmail(
                'nonexistent@example.com'
            );

            expect(result).toBeNull();
        });
    });

    describe('findById', () => {
        it('should call repository.findOne with correct parameters', async () => {
            const id = randomUUID();
            const mockUser = {
                id,
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
            } as User;

            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await userRepository.findById(id);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id },
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await userRepository.findById(randomUUID());

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create and save a new user', async () => {
            const createUserDto: CreateUserDto = {
                email: 'newuser@example.com',
                password: 'hashedPassword123',
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const mockUser = {
                id: randomUUID(),
                ...createUserDto,
            } as User;

            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await userRepository.create(createUserDto);

            expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockUser);
        });
    });

    describe('update', () => {
        it('should update user and return updated entity', async () => {
            const userId = randomUUID();
            const updateUserDto: UpdateUserDto = {
                firstName: 'UpdatedFirstName',
                lastName: 'UpdatedLastName',
            };

            const updatedUser = {
                id: userId,
                email: 'test@example.com',
                ...updateUserDto,
            } as User;

            mockRepository.update.mockResolvedValue(undefined as any);
            mockRepository.findOne.mockResolvedValue(updatedUser);

            const result = await userRepository.update(userId, updateUserDto);

            expect(mockRepository.update).toHaveBeenCalledWith(
                userId,
                updateUserDto
            );
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
            });
            expect(result).toEqual(updatedUser);
        });

        it('should throw error when user not found after update', async () => {
            const userId = randomUUID();
            const updateUserDto: UpdateUserDto = {
                firstName: 'UpdatedFirstName',
            };

            mockRepository.update.mockResolvedValue(undefined as any);
            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                userRepository.update(userId, updateUserDto)
            ).rejects.toThrow('User not found after update');
        });
    });
});
