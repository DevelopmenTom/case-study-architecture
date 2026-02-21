import request from 'supertest';

describe('UserController Integration Tests', () => {
    const baseUrl = 'http://localhost:9000/partner-app/api';

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
    });
});
