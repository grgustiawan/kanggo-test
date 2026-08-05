import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    deadline: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters').optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    deadline: z.string().datetime({ message: 'Invalid datetime format' }).nullable().optional(),
});

export const taskQuerySchema = z.object({
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    search: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1, 'Limit must be at least 1').max(1000, 'Limit must be at most 1000').default(20),
});
