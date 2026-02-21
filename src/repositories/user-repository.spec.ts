import {
    UserRepository,
    CreateUserDto,
    UpdateUserDto,
} from './user-repository';
import { User } from '../entities';
import { DISymbols } from '../lib';
import {
    diContainer,
    initializeDataSourceInContainer,
} from '../../inversify.config';
import { mockUserData } from '../testHelpers/mockUserData';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';

describe('UserRepository', () => {
    let dataSource: DataSource;
    let userRepository: UserRepository;
    let savedUser: User;

    beforeAll(async () => {
        await initializeDataSourceInContainer();
        dataSource = diContainer.get<DataSource>(DISymbols.DB);
        userRepository = diContainer.get<UserRepository>(
            DISymbols.UserRepository
        );
    });

    describe('findByEmail', () => {
        it('should return correct User ID when found by email', async () => {
            savedUser = await dataSource
                .getRepository(User)
                .save(mockUserData());

            const result = await userRepository.findByEmail(savedUser.email);

            expect(result!.id).toEqual(savedUser.id);
        });

        it('should return null when user not found by email', async () => {
            const nonExistentEmail = `test-non-existent-${Date.now()}@example.com`;
            const result = await userRepository.findByEmail(nonExistentEmail);

            expect(result).toBeNull();
        });
    });

    describe('findById', () => {
        it('should return correct email when found by id', async () => {
            savedUser = await dataSource
                .getRepository(User)
                .save(mockUserData());

            const result = await userRepository.findById(savedUser.id);

            expect(result!.email).toEqual(savedUser.email);
        });

        it('should return null when user not found by id', async () => {
            const result = await userRepository.findById(randomUUID());

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should return id of the created user', async () => {
            const createUserDto: CreateUserDto = {
                email: `newuser-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const result = await userRepository.create(createUserDto);

            expect(result.id).toBeDefined();
        });
    });

    describe('update', () => {
        it('should update user first and last name', async () => {
            savedUser = await dataSource
                .getRepository(User)
                .save(mockUserData());

            const updateUserDto: UpdateUserDto = {
                firstName: 'UpdatedFirstName',
                lastName: 'UpdatedLastName',
            };

            await userRepository.update(savedUser.id, updateUserDto);

            const updatedUser = await userRepository.findById(savedUser.id);

            expect(
                `${updatedUser?.firstName} ${updatedUser?.lastName}`
            ).toEqual(`${updateUserDto.firstName} ${updateUserDto.lastName}`);
        });
    });
});
