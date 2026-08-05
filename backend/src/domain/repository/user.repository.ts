import type { User, CreateUserInput } from '../models/user';

export interface IUserRepository {
    findByEmail(organizationId: number, email: string): Promise<User | null>;
    create(input: CreateUserInput): Promise<User>;
    findById(id: number): Promise<User | null>;
    updateLastLogin(id: number, ip: string): Promise<void>;
    list(organizationId: number, search?: string, cursor?: string, page?: number, limit?: number, mode?: 'mobile' | 'desktop'): Promise<{ data: User[]; nextCursor?: string | null; total?: number; hasMore?: boolean; page?: number }>;
}
