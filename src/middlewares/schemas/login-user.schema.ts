import { z } from 'zod';

export const loginUserSchema = z.object({
    email: z
        .email({ error: 'Invalid email format' })
        .transform(email => email.toLowerCase().trim()),
    password: z.string().min(1, 'Password is required'),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
