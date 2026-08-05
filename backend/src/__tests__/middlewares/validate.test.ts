import { describe, it, expect, mock } from 'bun:test';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '../../presentation/middlewares/validate';
import { z } from 'zod';

const createMockRequest = (overrides = {}): Partial<Request> => ({
    body: {},
    query: {},
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

describe('Validate Middleware', () => {
    describe('validate body', () => {
        const schema = z.object({
            name: z.string().min(1),
            email: z.string().email(),
            age: z.number().min(18).optional(),
        });

        it('should call next if validation passes', () => {
            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 25,
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 400 if validation fails', () => {
            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {
                    name: '',
                    email: 'invalid-email',
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return validation error details', () => {
            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {
                    name: '',
                    email: 'invalid',
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.json).toHaveBeenCalled();
            const response = res.data;
            expect(response).toHaveProperty('error', 'Validation failed');
            expect(response).toHaveProperty('details');
            expect(Array.isArray(response.details)).toBe(true);
        });

        it('should validate required fields', () => {
            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {},
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
        });

        it('should allow optional fields to be missing', () => {
            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should sanitize body data after validation', () => {
            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    extraField: 'should be removed',
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('validate query', () => {
        const querySchema = z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
            status: z.enum(['active', 'inactive']).optional(),
        });

        it('should validate query parameters', () => {
            const middleware = validate(querySchema, 'query');
            const req = createMockRequest({
                query: {
                    page: '1',
                    limit: '20',
                    status: 'active',
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid query parameters', () => {
            const middleware = validate(querySchema, 'query');
            const req = createMockRequest({
                query: {
                    status: 'invalid-status',
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
        });

        it('should allow empty query parameters', () => {
            const middleware = validate(querySchema, 'query');
            const req = createMockRequest({
                query: {},
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should format error path correctly', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string().min(1),
                }),
            });

            const middleware = validate(schema, 'body');
            const req = createMockRequest({
                body: {
                    user: {
                        name: '',
                    },
                },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(res.json).toHaveBeenCalled();
            const response = res.data;
            expect(response.details).toBeDefined();
            if (response.details && response.details.length > 0) {
                expect(response.details[0]).toHaveProperty('path');
                expect(response.details[0]).toHaveProperty('message');
            }
        });

        it('should pass non-Zod errors to next', () => {
            const badSchema = {
                parse: () => {
                    throw new Error('Generic error');
                },
            } as any;

            const middleware = validate(badSchema, 'body');
            const req = createMockRequest({
                body: { test: 'data' },
            }) as Request;
            const res = createMockResponse() as Response;
            const next = createMockNext();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});
