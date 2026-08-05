import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = source === 'body' ? req.body : req.query;
            const validated = schema.parse(data);
            
            if (source === 'body') {
                req.body = validated;
            } else {
                Object.keys(req.query).forEach(key => delete req.query[key]);
                Object.assign(req.query, validated);
            }
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = error.errors || error.issues || [];
                return res.status(400).json({
                    error: 'Validation failed',
                    details: issues.map(err => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};
