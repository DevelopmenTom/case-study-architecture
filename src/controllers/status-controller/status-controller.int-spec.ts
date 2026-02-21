import request from 'supertest';

describe('StatusController Integration Tests', () => {
    const baseUrl = 'http://localhost:9000/partner-app/api';

    it('should return 200 status code', async () => {
        const response = await request(baseUrl).get('/status');

        expect(response.status).toBe(200);
    });
});
