import type { Request, Response } from 'express';
import { TaskService } from '../../application/services/task.service';
import { TaskRepository } from '../../infrastructure/repositories/task.repository';

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

export const list = async (req: Request, res: Response) => {
    try {
        const { status, search, cursor, limit, page, mode } = req.query as any;
        
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const result = await taskService.list({
            organizationId: req.user.organizationId,
            status,
            search,
            cursor,
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : 20,
            mode: mode as 'mobile' | 'desktop' | undefined,
        });
        
        res.status(200).json(result);
    } catch (error) {
        console.error('List tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        const task = await taskService.getById(id);
        
        res.status(200).json({ task });
    } catch (error) {
        if (error instanceof Error && error.message === 'Task not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const { title, description, priority, deadline } = req.body;
        const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
        
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const task = await taskService.create(
            {
                organizationId: req.user.organizationId,
                title,
                description,
                priority,
                deadline: deadline ? new Date(deadline) : undefined,
                userId: req.user.userId,
                createdBy: req.user.userId,
            },
            idempotencyKey
        );
        
        res.status(201).json({ task });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, description, status, priority, deadline } = req.body;
        const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
        
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const task = await taskService.update(
            id,
            {
                title,
                description,
                status,
                priority,
                deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
                updatedBy: req.user.userId,
            },
            idempotencyKey
        );
        
        res.status(200).json({ task });
    } catch (error) {
        if (error instanceof Error && error.message === 'Task not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        await taskService.delete(id, req.user.userId);
        
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        if (error instanceof Error && error.message === 'Task not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
