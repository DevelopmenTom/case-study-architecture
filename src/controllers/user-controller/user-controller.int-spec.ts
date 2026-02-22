import request from 'supertest';
import { DataSource } from 'typeorm';

import {
    diContainer,
    initializeDataSourceInContainer,
} from '../../../inversify.config';
import { User } from '../../entities';
import { DISymbols } from '../../lib';
import { UserRoles } from '../../types/enums';
import { AuthService } from '../../types/services';

describe('UserController Integration Tests', () => {
    const baseUrl = 'http://localhost:9000/partner-app/api';
    let dataSource: DataSource;

    beforeAll(async () => {
        await initializeDataSourceInContainer();
        dataSource = diContainer.get<DataSource>(DISymbols.DB);
    });

    describe('POST /users/register', () => {
        it('should register a new user and get back code 201 and the created user id', async () => {
            const userData = {
                email: `test${Date.now()}@example.com`,
                unhashedPassword: 'Password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const response = await request(baseUrl)
                .post('/users/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        it('should get back 400 when password does not conform to rules', async () => {
            const userData = {
                email: `test${Date.now()}@example.com`,
                unhashedPassword: 'invalid',
                firstName: 'John',
                lastName: 'Doe',
            };

            const response = await request(baseUrl)
                .post('/users/register')
                .send(userData);

            expect(response.status).toBe(400);
        });

        it('should get back 500 with "Internal Server Error" when duplicate email causes TypeORM error', async () => {
            const duplicateEmail = `duplicate-test-${Date.now()}@example.com`;

            await dataSource.getRepository(User).save({
                email: duplicateEmail,
                password: 'hashedPassword123',
                firstName: 'Existing',
                lastName: 'User',
            });

            const userData = {
                email: duplicateEmail,
                unhashedPassword: 'Password123',
                firstName: 'Duplicate',
                lastName: 'User',
            };

            const response = await request(baseUrl)
                .post('/users/register')
                .send(userData);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('POST /users/login', () => {
        it('should register a user, then authenticate as this user and expect to get a token in response', async () => {
            const userData = {
                email: `logintest${Date.now()}@example.com`,
                unhashedPassword: 'Password123',
                firstName: 'Login',
                lastName: 'Test',
            };

            await request(baseUrl).post('/users/register').send(userData);

            const loginResponse = await request(baseUrl)
                .post('/users/login')
                .send({
                    email: userData.email,
                    password: userData.unhashedPassword,
                });

            expect(loginResponse.status).toBe(200);
            expect(typeof loginResponse.body.token).toBe('string');
        });

        it('should register as a user, call authenticate with wrong password, expect code 400 and message Invalid credentials', async () => {
            const userData = {
                email: `wrongpassword${Date.now()}@example.com`,
                unhashedPassword: 'Password123',
                firstName: 'Wrong',
                lastName: 'Password',
            };

            await request(baseUrl).post('/users/register').send(userData);

            const loginResponse = await request(baseUrl)
                .post('/users/login')
                .send({
                    email: userData.email,
                    password: 'WrongPassword456',
                });

            expect(loginResponse.status).toBe(400);
            expect(loginResponse.body.error).toBe('Invalid credentials');
        });
    });

    describe('GET /users/profile', () => {
        it('should save a user to DB, then get the profile for that user', async () => {
            const savedUser = await dataSource.getRepository(User).save({
                email: `profile-test-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Profile',
                lastName: 'User',
            });

            const authService = diContainer.get<AuthService>(
                DISymbols.AuthService
            );

            const token = authService.generateToken({
                userId: savedUser.id,
                role: UserRoles.USER,
            });

            const response = await request(baseUrl)
                .get('/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId: savedUser.id });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
            });
        });

        it('should return 401 when no auth header is provided', async () => {
            const savedUser = await dataSource.getRepository(User).save({
                email: `profile-test-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Profile',
                lastName: 'User',
            });

            const response = await request(baseUrl)
                .get('/users/profile')
                .send({ userId: savedUser.id });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });

        it('should return 401 with Unauthorized message when a user tries to get profile of another user', async () => {
            const userData1 = await dataSource.getRepository(User).save({
                email: `profile-test-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Profile',
                lastName: 'User',
            });

            const authService = diContainer.get<AuthService>(
                DISymbols.AuthService
            );

            const token1 = authService.generateToken({
                userId: userData1.id,
                role: UserRoles.USER,
            });

            const savedUser2 = await dataSource.getRepository(User).save({
                email: `user2-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'User',
                lastName: 'Two',
            });

            const response = await request(baseUrl)
                .get('/users/profile')
                .set('Authorization', `Bearer ${token1}`)
                .send({ userId: savedUser2.id });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('PUT /users/profile', () => {
        it('should save a user to DB, then update their profile', async () => {
            const savedUser = await dataSource.getRepository(User).save({
                email: `update-profile-test-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Original',
                lastName: 'Name',
            });

            const authService = diContainer.get<AuthService>(
                DISymbols.AuthService
            );

            const token = authService.generateToken({
                userId: savedUser.id,
                role: UserRoles.USER,
            });

            const response = await request(baseUrl)
                .put('/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    userId: savedUser.id,
                    firstName: 'Updated',
                    lastName: 'User',
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                email: savedUser.email,
                firstName: 'Updated',
                lastName: 'User',
            });
        });

        it('should save a user to DB, then update their profile as ADMIN', async () => {
            const savedUser = await dataSource.getRepository(User).save({
                email: `update-profile-admin-test-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Original',
                lastName: 'Name',
            });

            const authService = diContainer.get<AuthService>(
                DISymbols.AuthService
            );

            const adminToken = authService.generateToken({
                userId: crypto.randomUUID(),
                role: UserRoles.ADMIN,
            });

            const response = await request(baseUrl)
                .put('/users/profile')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    userId: savedUser.id,
                    firstName: 'AdminUpdated',
                    lastName: 'AdminUser',
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                email: savedUser.email,
                firstName: 'AdminUpdated',
                lastName: 'AdminUser',
            });
        });

        it('should return 401 when no auth header is provided', async () => {
            const savedUser = await dataSource.getRepository(User).save({
                email: `update-profile-no-auth-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Original',
                lastName: 'Name',
            });

            const response = await request(baseUrl).put('/users/profile').send({
                userId: savedUser.id,
                firstName: 'Updated',
                lastName: 'User',
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });

        it('should return 401 with Unauthorized message when a user tries to update profile of another user', async () => {
            const userData1 = await dataSource.getRepository(User).save({
                email: `user2-update-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'Profile',
                lastName: 'User',
            });

            const authService = diContainer.get<AuthService>(
                DISymbols.AuthService
            );

            const token1 = authService.generateToken({
                userId: userData1.id,
                role: UserRoles.USER,
            });

            const savedUser2 = await dataSource.getRepository(User).save({
                email: `user2-update-${Date.now()}@example.com`,
                password: 'hashedPassword123',
                firstName: 'User',
                lastName: 'Two',
            });

            const response = await request(baseUrl)
                .put('/users/profile')
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    userId: savedUser2.id,
                    firstName: 'Hacked',
                    lastName: 'User',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });
});
