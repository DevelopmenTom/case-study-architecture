import { NextFunction, Request, Response } from 'express';

import { diContainer } from '../../inversify.config';
import { DISymbols } from '../lib';
import { AuthService } from '../types/services';

export const authenticateRequest = () => {
    const authService = diContainer.get<AuthService>(DISymbols.AuthService);

    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        try {
            const payload = authService.verify(token);

            req.auth = {
                userId: payload.userId,
            };

            const { userId } = req.body;

            if (userId && payload.userId !== userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
};
