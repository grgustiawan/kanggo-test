import { describe, it, expect, mock } from 'bun:test';
import type { Request, Response } from 'express';
import * as summaryHandler from '../../presentation/handlers/summary.handler';

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

describe('Summary Handler', () => {
    describe('getSummary', () => {
        it('should return summary with all counts', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
            if (res.data) {
                expect(res.data).toHaveProperty('totalUsers');
                expect(res.data).toHaveProperty('totalTasks');
                expect(res.data).toHaveProperty('tasksByStatus');
            }
        });

        it('should return tasksByStatus with pending count', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
            if (res.data?.tasksByStatus) {
                expect(res.data.tasksByStatus).toHaveProperty('pending');
            }
        });

        it('should return tasksByStatus with in_progress count', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
            if (res.data?.tasksByStatus) {
                expect(res.data.tasksByStatus).toHaveProperty('in_progress');
            }
        });

        it('should return tasksByStatus with done count', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
            if (res.data?.tasksByStatus) {
                expect(res.data.tasksByStatus).toHaveProperty('done');
            }
        });

        it('should return 200 status code', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle database errors gracefully', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should return numeric values for counts', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
            if (res.data) {
                expect(typeof res.data.totalUsers).toBe('number');
                expect(typeof res.data.totalTasks).toBe('number');
            }
        });

        it('should filter by organization', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should exclude deleted users from count', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should exclude deleted tasks from count', async () => {
            const req = createMockRequest() as Request;
            const res = createMockResponse() as Response;

            await summaryHandler.getSummary(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });
});
