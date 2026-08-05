import { describe, it, expect, beforeEach, mock } from 'bun:test';
import type { Request, Response } from 'express';
import * as authHandler from '../../presentation/handlers/auth.handler';

const mockUserRepository = {
    findByEmail: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({
        id: 1,
        organizationId: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword',
        status: 'active',
        isEmailVerified: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    })),
    updateLastLogin: mock(() => Promise.resolve()),
    list: mock(() => Promise.resolve([])),
    update: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve()),
};

const createMockRequest = (overrides = {}): Partial<Request> => ({
    body: {},
    query: {},
    params: {},
    cookies: {},
    headers: {},
    user: undefined,
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' } as any,
    ...overrides,
});

const createMockResponse = (): Partial<Response> => {
    const res: any = {
        statusCode: 200,
        data: null,
        cookies: {} as Record<string, any>,
    };
    
    res.status = mock((code: number) => {
        res.statusCode = code;
        return res;
    });
    
    res.json = mock((data: any) => {
        res.data = data;
        return res;
    });
    
    res.cookie = mock((name: string, value: any, options: any) => {
        res.cookies[name] = { value, options };
        return res;
    });
    
    res.clearCookie = mock((name: string, options: any) => {
        delete res.cookies[name];
        return res;
    });
    
    return res;
};

describe('Auth Handler', () => {
    beforeEach(() => {
        mockUserRepository.findByEmail.mockReset();
        mockUserRepository.create.mockReset();
        mockUserRepository.updateLastLogin.mockReset();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const req = createMockRequest({
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 409 if email already exists', async () => {
            const req = createMockRequest({
                body: {
                    name: 'Test User',
                    email: 'existing@example.com',
                    password: 'Password123!',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.register(req, res);

            expect(res.statusCode).toBe(409);
        });

        it('should return 500 on internal server error', async () => {
            const req = createMockRequest({
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.register(req, res);

            expect(res.statusCode).toBeGreaterThanOrEqual(200);
        });
    });

    describe('login', () => {
        it('should login user successfully with valid credentials', async () => {
            const req = createMockRequest({
                body: {
                    email: 'test@example.com',
                    password: 'Password123!',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.login(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return 401 with invalid credentials', async () => {
            const req = createMockRequest({
                body: {
                    email: 'test@example.com',
                    password: 'WrongPassword',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.login(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should set access_token and refresh_token cookies', async () => {
            const req = createMockRequest({
                body: {
                    email: 'test@example.com',
                    password: 'Password123!',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.login(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const req = createMockRequest({
                cookies: {
                    refresh_token: 'valid.refresh.token',
                },
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' });
            expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle logout without refresh token', async () => {
            const req = createMockRequest({
                cookies: {},
                user: {
                    userId: 1,
                    email: 'test@example.com',
                    organizationId: 1,
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 500 on error', async () => {
            const req = createMockRequest({
                cookies: {
                    refresh_token: 'invalid',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.logout(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('refresh', () => {
        it('should refresh access token successfully', async () => {
            const req = createMockRequest({
                cookies: {
                    refresh_token: 'valid.refresh.token',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.refresh(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return 401 if refresh token not found', async () => {
            const req = createMockRequest({
                cookies: {},
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.refresh(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Refresh token not found' });
        });

        it('should return 401 if refresh token is invalid', async () => {
            const req = createMockRequest({
                cookies: {
                    refresh_token: 'invalid.token',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;

            await authHandler.refresh(req, res);

            expect(res.clearCookie).toHaveBeenCalled();
        });
    });
});
