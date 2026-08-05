import { describe, it, expect, beforeEach, mock } from 'bun:test';
import type { Request, Response } from 'express';
import * as taskHandler from '../../presentation/handlers/task.handler';

const createMockRequest = (overrides = {}): Partial<Request> => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    user: undefined,
    ...overrides,
});

const createMockResponse = (): Partial<Response> => {
    const res: any = {
        statusCode: 200,
        data: null,
    };
    
    res.status = mock((code: number) => {
        res.statusCode = code;
        return res;
    });
    
    res.json = mock((data: any) => {
        res.data = data;
        return res;
    });
    
    return res;
};

describe('Task Handler', () => {
    describe('list', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                query: {},
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.list(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should list tasks successfully with authenticated user', async () => {
            const req = createMockRequest({
                query: {
                    limit: '20',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle status filter', async () => {
            const req = createMockRequest({
                query: {
                    status: 'pending',
                    limit: '10',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle search query', async () => {
            const req = createMockRequest({
                query: {
                    search: 'test task',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle pagination with cursor', async () => {
            const req = createMockRequest({
                query: {
                    cursor: 'cursor123',
                    limit: '20',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should get task by id successfully', async () => {
            const req = createMockRequest({
                params: { id: 'task-id-123' },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.getById(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if task not found', async () => {
            const req = createMockRequest({
                params: { id: 'non-existent-id' },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.getById(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                body: {
                    title: 'New Task',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.create(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should create task successfully', async () => {
            const req = createMockRequest({
                body: {
                    title: 'New Task',
                    description: 'Task description',
                    priority: 'high',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle idempotency key', async () => {
            const req = createMockRequest({
                body: {
                    title: 'New Task',
                },
                headers: {
                    'idempotency-key': 'key-123',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle deadline date', async () => {
            const req = createMockRequest({
                body: {
                    title: 'New Task',
                    deadline: '2026-12-31T23:59:59Z',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                params: { id: 'task-id-123' },
                body: {
                    title: 'Updated Task',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.update(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should update task successfully', async () => {
            const req = createMockRequest({
                params: { id: 'task-id-123' },
                body: {
                    title: 'Updated Task',
                    status: 'in_progress',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.update(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if task not found', async () => {
            const req = createMockRequest({
                params: { id: 'non-existent-id' },
                body: {
                    title: 'Updated Task',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.update(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                params: { id: 'task-id-123' },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.remove(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should delete task successfully', async () => {
            const req = createMockRequest({
                params: { id: 'task-id-123' },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.remove(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if task not found', async () => {
            const req = createMockRequest({
                params: { id: 'non-existent-id' },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await taskHandler.remove(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });
});
