import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { TaskService } from '../../application/services/task.service';
import { CacheService } from '../../application/services/cache.service';

const mockTaskRepository = {
    create: mock(),
    update: mock(),
    findById: mock(),
    list: mock(),
    softDelete: mock(),
};

const mockCacheService = {
    get: mock(),
    set: mock(),
    invalidatePattern: mock(),
    buildSearchKey: mock(),
};

mock.module('../../application/services/cache.service', () => {
    return {
        CacheService: mock().mockImplementation(() => mockCacheService)
    };
});

const mockTask = {
    id: 'task-123',
    organizationId: 1,
    taskNumber: 'TASK-001',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending' as const,
    priority: 'medium' as const,
    deadline: null,
    userId: 1,
    createdBy: 1,
    updatedBy: null,
    deletedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

describe('TaskService', () => {
    let taskService: TaskService;

    beforeEach(() => {
        mockTaskRepository.create.mockReset();
        mockTaskRepository.update.mockReset();
        mockTaskRepository.findById.mockReset();
        mockTaskRepository.list.mockReset();
        mockTaskRepository.softDelete.mockReset();
        
        mockCacheService.get.mockReset();
        mockCacheService.set.mockReset();
        mockCacheService.invalidatePattern.mockReset();
        mockCacheService.buildSearchKey.mockReset();

        taskService = new TaskService(mockTaskRepository as any);
    });

    describe('create', () => {
        it('should create a task successfully and invalidate cache', async () => {
            mockTaskRepository.create.mockResolvedValue(mockTask);

            const input = {
                organizationId: 1,
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium' as const,
                userId: 1,
                createdBy: 1,
            };

            const result = await taskService.create(input);

            expect(result).toBeDefined();
            expect(result.title).toBe('Test Task');
            expect(mockTaskRepository.create).toHaveBeenCalledWith(input);
            expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('task:search:1:*');
        });
    });

    describe('update', () => {
        it('should update task successfully and invalidate cache', async () => {
            const updatedTask = { ...mockTask, title: 'Updated Task' };
            mockTaskRepository.findById.mockResolvedValue(mockTask);
            mockTaskRepository.update.mockResolvedValue(updatedTask);

            const result = await taskService.update('task-123', { title: 'Updated Task' });

            expect(result.title).toBe('Updated Task');
            expect(mockTaskRepository.update).toHaveBeenCalledWith('task-123', { title: 'Updated Task' });
            expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('task:search:1:*');
        });
    });

    describe('delete', () => {
        it('should soft delete task successfully and invalidate cache', async () => {
            mockTaskRepository.findById.mockResolvedValue(mockTask);
            mockTaskRepository.softDelete.mockResolvedValue(undefined);

            await taskService.delete('task-123', 1);

            expect(mockTaskRepository.softDelete).toHaveBeenCalledWith('task-123', 1);
            expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('task:search:1:*');
        });
    });

    describe('list', () => {
        it('should return cached list if cache hit', async () => {
            const cachedResult = { data: [mockTask], nextCursor: null, hasMore: false };
            mockCacheService.buildSearchKey.mockReturnValue('cache-key');
            mockCacheService.get.mockResolvedValue(cachedResult);

            const result = await taskService.list({ organizationId: 1, limit: 10 });

            expect(result).toEqual(cachedResult);
            expect(mockTaskRepository.list).not.toHaveBeenCalled();
            expect(mockCacheService.get).toHaveBeenCalledWith('cache-key');
        });

        it('should fetch from repository and set cache on cache miss', async () => {
            const dbResult = { data: [mockTask], nextCursor: null, hasMore: false };
            mockCacheService.buildSearchKey.mockReturnValue('cache-key');
            mockCacheService.get.mockResolvedValue(null);
            mockTaskRepository.list.mockResolvedValue(dbResult);

            const result = await taskService.list({ organizationId: 1, limit: 10 });

            expect(result).toEqual(dbResult);
            expect(mockTaskRepository.list).toHaveBeenCalledWith({ organizationId: 1, limit: 10 });
            expect(mockCacheService.set).toHaveBeenCalledWith('cache-key', dbResult, 300);
        });
    });
});
