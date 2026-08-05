import type { users } from '../../infrastructure/db/schema';

export type User = typeof users.$inferSelect;

export type CreateUserInput = {
    organizationId: number;
    email: string;
    passwordHash: string;
    name: string;
    status?: 'active' | 'inactive' | 'suspended' | 'deleted';
    isEmailVerified?: number;
    createdBy?: number;
};

export type LoginInput = {
    email: string;
    password: string;
};
