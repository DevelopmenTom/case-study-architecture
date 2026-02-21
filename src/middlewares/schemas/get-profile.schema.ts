import { z } from 'zod';

export const getProfileSchema = z.object({
    userId: z.uuid({ error: 'Invalid user ID format' }),
});

export type GetProfileInput = z.infer<typeof getProfileSchema>;
