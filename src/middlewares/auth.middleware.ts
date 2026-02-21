import { NextFunction, Request, Response } from 'express';
import { diContainer } from '../../inversify.config';
import { DISymbols } from '../lib';
import { AuthService } from '../types/services';
import { UserRoles } from '../types/enums';

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
                role: payload.role,
                userId: payload.userId,
            };

            if (payload.role === UserRoles.ADMIN) {
                return next();
            }

            if (payload.role === UserRoles.USER) {
                const { userId } = req.body;

                if (payload.userId !== userId) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }

                return next();
            }

            return res.status(401).json({ error: 'Unauthorized' });
        } catch (error) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
};
