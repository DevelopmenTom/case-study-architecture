import * as jwt from 'jsonwebtoken';

import { ITokenPayload } from '../../types/payloads';

import { AuthServiceImpl } from './auth-service';

jest.mock('jsonwebtoken');

describe('AuthService (unit tests)', () => {
    let authService: AuthServiceImpl;
    const mockJwt = jwt as jest.Mocked<typeof jwt>;

    beforeEach(() => {
        authService = new AuthServiceImpl();
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should call jwt.sign with correct parameters', () => {
            const payload: ITokenPayload = {
                userId: 'user-123',
            };
            const mockToken = 'mock-jwt-token';
            const mockSecret = 'test-secret';
            const mockExpiresIn = '1h';

            process.env.JWT_SECRET = mockSecret;
            process.env.JWT_EXPIRES_IN = mockExpiresIn;

            mockJwt.sign.mockReturnValue(mockToken as any);

            const result = authService.generateToken(payload);

            expect(mockJwt.sign).toHaveBeenCalledWith(payload, mockSecret, {
                expiresIn: mockExpiresIn,
            });
            expect(result).toBe(mockToken);
        });

        it('should throw an error if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;

            const payload: ITokenPayload = {
                userId: 'user-789',
            };

            expect(() => authService.generateToken(payload)).toThrow(
                'JWT_SECRET is not defined in environment variables'
            );
        });

        it('should use JWT_EXPIRES_IN from environment', () => {
            const payload: ITokenPayload = {
                userId: 'user-456',
            };
            const mockExpiresIn = '2d';

            process.env.JWT_SECRET = 'secret';
            process.env.JWT_EXPIRES_IN = mockExpiresIn;

            mockJwt.sign.mockReturnValue('token' as any);

            authService.generateToken(payload);

            expect(mockJwt.sign).toHaveBeenCalledWith(payload, 'secret', {
                expiresIn: mockExpiresIn,
            });
        });
    });

    describe('verify', () => {
        it('should call jwt.verify with correct parameters', () => {
            const token = 'mock-token';
            const mockSecret = 'test-secret';
            const mockPayload: ITokenPayload = {
                userId: 'user-123',
            };

            process.env.JWT_SECRET = mockSecret;

            mockJwt.verify.mockReturnValue(mockPayload as any);

            const result = authService.verify(token);

            expect(mockJwt.verify).toHaveBeenCalledWith(token, mockSecret);
            expect(result).toEqual(mockPayload);
        });

        it('should throw an error if JWT_SECRET is not defined', () => {
            delete process.env.JWT_SECRET;

            expect(() => authService.verify('some-token')).toThrow(
                'JWT_SECRET is not defined in environment variables'
            );
            expect(mockJwt.verify).not.toHaveBeenCalled();
        });

        it('should return the decoded payload from jwt.verify', () => {
            const token = 'valid-token';
            const mockPayload: ITokenPayload = {
                userId: 'user-999',
            };

            process.env.JWT_SECRET = 'secret';

            mockJwt.verify.mockReturnValue(mockPayload as any);

            const result = authService.verify(token);

            expect(result).toEqual(mockPayload);
        });
    });
});
