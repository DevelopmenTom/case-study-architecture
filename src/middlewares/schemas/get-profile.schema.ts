import { z } from 'zod';

export const getProfileSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
});

export type GetProfileInput = z.infer<typeof getProfileSchema>;
