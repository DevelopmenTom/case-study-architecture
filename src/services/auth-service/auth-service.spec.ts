import { diContainer } from '../../../inversify.config';
import { AuthService } from '../../types/services/AuthService';
import { DISymbols } from '../../lib';
import { UserRoles } from '../../types/enums';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
    let authService: AuthService;

    beforeAll(() => {
        authService = diContainer.get<AuthService>(DISymbols.AuthService);
    });

    describe('generateToken', () => {
        it('should generate return the JWT token as string', () => {
            const payload = {
                userId: 'user-123',
                role: UserRoles.USER,
            };

            const token = authService.generateToken(payload);

            expect(typeof token).toBe('string');
        });

        it('should generate a token that can be decoded with the correct payload', () => {
            const payload = {
                userId: 'user-456',
                role: UserRoles.ADMIN,
            };

            const token = authService.generateToken(payload);
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });

        it('should throw an error if JWT_SECRET is not defined', () => {
            const originalSecret = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            const payload = {
                userId: 'user-789',
                role: UserRoles.USER,
            };

            expect(() => authService.generateToken(payload)).toThrow(
                'JWT_SECRET is not defined in environment variables'
            );

            process.env.JWT_SECRET = originalSecret;
        });

        it('should generate different tokens for different payloads', () => {
            const payload1 = {
                userId: 'user-1',
                role: UserRoles.USER,
            };

            const payload2 = {
                userId: 'user-2',
                role: UserRoles.ADMIN,
            };

            const token1 = authService.generateToken(payload1);
            const token2 = authService.generateToken(payload2);

            expect(token1).not.toBe(token2);
        });
    });
});
