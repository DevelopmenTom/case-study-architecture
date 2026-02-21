import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerUserSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .transform(email => email.toLowerCase().trim()),
    firstName: z
        .string()
        .min(1, 'First name is required')
        .transform(name => name.trim()),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .transform(name => name.trim()),
    unhashedPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
