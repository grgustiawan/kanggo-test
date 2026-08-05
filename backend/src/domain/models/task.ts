import type { tasks } from '../../infrastructure/db/schema';

export type Task = typeof tasks.$inferSelect;

export type CreateTaskInput = {
    organizationId: number;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    deadline?: Date;
    userId: number;
    createdBy: number;
};

export type UpdateTaskInput = {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    deadline?: Date | null;
    updatedBy: number;
};

export type TaskListQuery = {
    organizationId: number;
    status?: 'pending' | 'in_progress' | 'done';
    search?: string;
    cursor?: string;
    page?: number;
    limit: number;
    mode?: 'mobile' | 'desktop';
};
