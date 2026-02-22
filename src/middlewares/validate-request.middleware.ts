import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

type ClassConstructor<T = any> = new (...args: any[]) => T;

export const validateRequest = (dtoClass: ClassConstructor) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dtoInstance = plainToInstance(dtoClass, req.body, {
                enableImplicitConversion: true,
                excludeExtraneousValues: true,
            });

            const errors: ValidationError[] = await validate(dtoInstance);

            if (errors.length > 0) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.flatMap(err => {
                        const constraints = err.constraints
                            ? Object.values(err.constraints)
                            : [];
                        return constraints.map(message => ({
                            path: err.property,
                            message,
                        }));
                    }),
                });
                return;
            }

            req.body = dtoInstance;
            next();
        } catch (error) {
            res.status(400).json({ error: 'Invalid request body' });
        }
    };
};
