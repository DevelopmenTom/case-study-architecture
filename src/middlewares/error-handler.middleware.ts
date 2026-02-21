import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = error.statusCode;

    if (!statusCode || statusCode < 400 || statusCode >= 500) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.status(statusCode).json({ error: error.message });
};
