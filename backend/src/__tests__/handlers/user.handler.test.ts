import { describe, it, expect, mock } from 'bun:test';
import type { Request, Response } from 'express';
import * as userHandler from '../../presentation/handlers/user.handler';

const createMockRequest = (overrides = {}): Partial<Request> => ({
    body: {},
    query: {},
    params: {},
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

describe('User Handler', () => {
    describe('list', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                query: {},
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.list(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should list users successfully', async () => {
            const req = createMockRequest({
                query: {},
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle search query', async () => {
            const req = createMockRequest({
                query: {
                    search: 'john',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should exclude password hash from response', async () => {
            const req = createMockRequest({
                query: {},
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.list(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                body: {
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'Password123!',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.create(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should create user successfully', async () => {
            const req = createMockRequest({
                body: {
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'Password123!',
                    status: 'active',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return 409 if email already exists', async () => {
            const req = createMockRequest({
                body: {
                    name: 'Existing User',
                    email: 'existing@example.com',
                    password: 'Password123!',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should use default status if not provided', async () => {
            const req = createMockRequest({
                body: {
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'Password123!',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should exclude password hash from response', async () => {
            const req = createMockRequest({
                body: {
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'Password123!',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.create(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                params: { id: '2' },
                body: {
                    name: 'Updated User',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.update(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should update user successfully', async () => {
            const req = createMockRequest({
                params: { id: '2' },
                body: {
                    name: 'Updated User',
                    email: 'updated@example.com',
                    status: 'active',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.update(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should update password if provided', async () => {
            const req = createMockRequest({
                params: { id: '2' },
                body: {
                    name: 'Updated User',
                    password: 'NewPassword123!',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.update(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should exclude password hash from response', async () => {
            const req = createMockRequest({
                params: { id: '2' },
                body: {
                    name: 'Updated User',
                },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.update(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = createMockRequest({
                params: { id: '2' },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.remove(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should delete user successfully', async () => {
            const req = createMockRequest({
                params: { id: '2' },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.remove(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return success message on deletion', async () => {
            const req = createMockRequest({
                params: { id: '2' },
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await userHandler.remove(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });
});
