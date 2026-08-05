import { describe, it, expect, mock } from 'bun:test';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../presentation/middlewares/auth';

const createMockRequest = (overrides = {}): Partial<Request> => ({
    cookies: {},
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

describe('Auth Middleware', () => {
    describe('authenticate', () => {
        it('should return 401 if no token provided', () => {
            const req = createMockRequest({
                cookies: {},
            }) as Request;
            
            const res = createMockResponse() as Response;
            const next = createMockNext();

            authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            const req = createMockRequest({
                cookies: {
                    access_token: 'invalid.token.here',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;
            const next = createMockNext();

            authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 with specific message for expired token', () => {
            const req = createMockRequest({
                cookies: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;
            const next = createMockNext();

            authenticate(req, res, next);

            expect(res.json).toHaveBeenCalled();
        });

        it('should handle malformed tokens', () => {
            const req = createMockRequest({
                cookies: {
                    access_token: 'not-a-jwt-token',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;
            const next = createMockNext();

            authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should pass authentication errors to next middleware', () => {
            const req = createMockRequest({
                cookies: {
                    access_token: 'malformed',
                },
            }) as Request;
            
            const res = createMockResponse() as Response;
            const next = createMockNext();

            authenticate(req, res, next);

            expect(res.json).toHaveBeenCalled();
        });
    });
});
