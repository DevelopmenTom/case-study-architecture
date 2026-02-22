import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

import { ITokenPayload } from '../types/payloads';

import { authenticateRequest } from './auth.middleware';

describe('authenticateRequest', () => {
    const JWT_SECRET = 'test-secret';
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;
    let originalJwtSecret: string | undefined;

    beforeAll(() => {
        originalJwtSecret = process.env.JWT_SECRET;
        process.env.JWT_SECRET = JWT_SECRET;
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    const generateToken = (payload: ITokenPayload): string => {
        return jwt.sign(payload, JWT_SECRET);
    };

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockReq = {
            headers: {},
            body: {},
        };

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };

        mockNext = jest.fn();
    });

    describe('token verification', () => {
        it('should return 401 if no authorization header is provided', () => {
            const middleware = authenticateRequest();

            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            mockReq.headers = { authorization: 'Bearer invalid-token' };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('attaching auth to req.auth', () => {
        it('should attach role and userId to req.auth', () => {
            const payload = { userId: 'user-456' };
            const token = generateToken(payload);

            mockReq.headers = { authorization: `Bearer ${token}` };
            mockReq.body = { userId: 'user-456' };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockReq.auth).toEqual({
                userId: 'user-456',
            });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should attach auth before checking authorization ', () => {
            const payload = { userId: 'user-789' };
            const token = generateToken(payload);

            mockReq.headers = { authorization: `Bearer ${token}` };
            mockReq.body = { userId: 'different-user' };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockReq.auth).toEqual({
                userId: 'user-789',
            });
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('user authorization', () => {
        it('should allow user to proceed if userId matches token', () => {
            const payload = { userId: 'user-123' };
            const token = generateToken(payload);

            mockReq.headers = { authorization: `Bearer ${token}` };
            mockReq.body = { userId: 'user-123' };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
        });

        it('should return 401 if userId does not match token', () => {
            const payload = { userId: 'user-123' };
            const token = generateToken(payload);

            mockReq.headers = { authorization: `Bearer ${token}` };
            mockReq.body = { userId: 'user-456' };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('Bearer token format', () => {
        it('should handle token with Bearer prefix', () => {
            const payload = { userId: 'user-123' };
            const token = generateToken(payload);

            mockReq.headers = { authorization: `Bearer ${token}` };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle token without Bearer prefix', () => {
            const payload = { userId: 'user-123' };
            const token = generateToken(payload);

            mockReq.headers = { authorization: token };

            const middleware = authenticateRequest();
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });
});
