import type { ITaskRepository } from '../../domain/repository/task.repository';
import type { CreateTaskInput, UpdateTaskInput, TaskListQuery, Task } from '../../domain/models/task';
import { redis } from '../../infrastructure/redis/redis';
import { CacheService } from './cache.service';

export class TaskService {
    private cacheService: CacheService;

    constructor(private taskRepository: ITaskRepository) {
        this.cacheService = new CacheService();
    }

    async create(input: CreateTaskInput, idempotencyKey?: string): Promise<Task> {
        if (idempotencyKey) {
            const cached = await redis.get(`idem:${idempotencyKey}`);
            if (cached) {
                const task = await this.taskRepository.findById(cached);
                if (task) {
                    return task;
                }
            }
        }

        const task = await this.taskRepository.create(input);

        if (idempotencyKey) {
            await redis.set(`idem:${idempotencyKey}`, task.id, 'EX', 86400);
        }

        await this.cacheService.invalidatePattern(`task:search:${input.organizationId}:*`);

        return task;
    }

    async update(id: string, input: UpdateTaskInput, idempotencyKey?: string): Promise<Task> {
        if (idempotencyKey) {
            const cached = await redis.get(`idem:${idempotencyKey}`);
            if (cached) {
                const task = await this.taskRepository.findById(id);
                if (task) {
                    return task;
                }
            }
        }

        const existingTask = await this.taskRepository.findById(id);
        if (!existingTask) {
            throw new Error('Task not found');
        }

        const updatedTask = await this.taskRepository.update(id, input);

        if (idempotencyKey) {
            await redis.set(`idem:${idempotencyKey}`, updatedTask.id, 'EX', 86400);
        }

        await this.cacheService.invalidatePattern(`task:search:${existingTask.organizationId}:*`);

        return updatedTask;
    }

    async delete(id: string, userId: number): Promise<void> {
        const existingTask = await this.taskRepository.findById(id);
        if (!existingTask) {
            throw new Error('Task not found');
        }

        await this.taskRepository.softDelete(id, userId);

        await this.cacheService.invalidatePattern(`task:search:${existingTask.organizationId}:*`);
    }

    async list(query: TaskListQuery): Promise<{ data: any[], nextCursor?: string | null, total?: number, hasMore?: boolean, page?: number }> {
        const cacheKey = this.cacheService.buildSearchKey(query.organizationId, query);

        const cached = await this.cacheService.get<{ data: any[], nextCursor?: string | null, total?: number, hasMore?: boolean, page?: number }>(cacheKey);
        if (cached) {
            return cached;
        }

        const result = await this.taskRepository.list(query);
        
        await this.cacheService.set(cacheKey, result, 300);
        
        return result;
    }

    async getById(id: string): Promise<Task> {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }
}
