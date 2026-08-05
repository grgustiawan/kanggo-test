import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(150, 'Name must be at most 150 characters'),
    email: z.string().email('Invalid email format').max(190, 'Email must be at most 190 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});
