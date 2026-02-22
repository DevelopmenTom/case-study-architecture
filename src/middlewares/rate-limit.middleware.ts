import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = () => {
    return rateLimit({
        windowMs: 2 * 60 * 1000, // 2 minutes
        limit: 20,
        message: 'Service is currently unavailable, please try later',
        standardHeaders: false, // dont send limit info to clients. breaking limit is a suspected attack
        legacyHeaders: false,
    });
};
