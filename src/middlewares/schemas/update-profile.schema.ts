import { z } from 'zod';

export const updateProfileSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
