import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map(err => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            } else {
                res.status(400).json({ error: 'Invalid request body' });
            }
        }
    };
};
