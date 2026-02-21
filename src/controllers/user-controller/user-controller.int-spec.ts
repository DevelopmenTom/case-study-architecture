import request from 'supertest';
import { DataSource } from 'typeorm';
import {
    diContainer,
    initializeDataSourceInContainer,
} from '../../../inversify.config';
import { DISymbols } from '../../lib';
import { User } from '../../entities';

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
});
