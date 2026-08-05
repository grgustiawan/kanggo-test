import { describe, it, expect, mock } from 'bun:test';
import type { Request, Response, NextFunction } from 'express';
import { authorize } from '../../presentation/middlewares/authorize';

const createMockRequest = (overrides = {}): Partial<Request> => ({
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

const createMockNext = (): NextFunction => {
    return mock(() => {});
};

describe('Authorize Middleware', () => {
    describe('authorize', () => {
        it('should return 401 if user is not authenticated', () => {
            const middleware = authorize('admin');
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 if user does not have required role', () => {
            const middleware = authorize('admin');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'user@example.com',
                    organizationId: 1,
                    roles: ['user'],
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Forbidden',
                message: 'You do not have permission to access this resource',
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if user has required role', () => {
            const middleware = authorize('admin');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'admin@example.com',
                    organizationId: 1,
                    roles: ['admin'],
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should allow if user has one of multiple allowed roles', () => {
            const middleware = authorize('admin', 'manager');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'manager@example.com',
                    organizationId: 1,
                    roles: ['manager'],
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should allow if user has multiple roles including required one', () => {
            const middleware = authorize('admin');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'superuser@example.com',
                    organizationId: 1,
                    roles: ['admin', 'manager', 'user'],
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle user with no roles', () => {
            const middleware = authorize('admin');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'noroles@example.com',
                    organizationId: 1,
                    roles: [],
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle user with undefined roles', () => {
            const middleware = authorize('admin');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'undefroles@example.com',
                    organizationId: 1,
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should work with different role names', () => {
            const middleware = authorize('manager', 'supervisor');
            const req = createMockRequest({
                user: {
                    userId: 1,
                    email: 'supervisor@example.com',
                    organizationId: 1,
                    roles: ['supervisor'],
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
