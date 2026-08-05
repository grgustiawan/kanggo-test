import type { Task, CreateTaskInput, UpdateTaskInput, TaskListQuery } from '../models/task';

export interface ITaskRepository {
    create(input: CreateTaskInput): Promise<Task>;
    findById(id: string): Promise<Task | null>;
    update(id: string, input: UpdateTaskInput): Promise<Task>;
    softDelete(id: string, deletedBy: number): Promise<void>;
    list(query: TaskListQuery): Promise<{ data: any[], nextCursor?: string | null, total?: number, hasMore?: boolean, page?: number }>;
}
