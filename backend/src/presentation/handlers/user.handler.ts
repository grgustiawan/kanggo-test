import type { Request, Response } from 'express';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import argon2 from 'argon2';

const userRepository = new UserRepository();

export const list = async (req: Request, res: Response) => {
    try {
        const { search, cursor, page, limit, mode } = req.query as any;

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const parsedPage = page ? parseInt(page as string, 10) : undefined;
        const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;
        const requestedMode = mode as 'mobile' | 'desktop' | undefined;

        const result = await userRepository.list(
            req.user.organizationId,
            search,
            cursor,
            parsedPage,
            parsedLimit,
            requestedMode
        );
        
        const safeUsers = result.data.map(({ passwordHash, ...user }) => user);
        
        res.status(200).json({
            data: safeUsers,
            nextCursor: result.nextCursor,
            total: result.total,
            hasMore: result.hasMore,
            page: result.page,
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const { name, email, password, status } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const existingUser = await userRepository.findByEmail(req.user.organizationId, email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const passwordHash = await argon2.hash(password);

        const user = await userRepository.create({
            organizationId: req.user.organizationId,
            email,
            passwordHash,
            name,
            status: status || 'active',
            isEmailVerified: 0,
            createdBy: req.user.userId,
        });

        const { passwordHash: _, ...safeUser } = user;
        res.status(201).json({ data: safeUser });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, status, password } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const updateData: any = { name, email, status, updatedBy: req.user.userId };

        if (password) {
            updateData.passwordHash = await argon2.hash(password);
        }

        const user = await userRepository.update(Number(id), updateData);
        const { passwordHash: _, ...safeUser } = user;
        
        res.status(200).json({ data: safeUser });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await userRepository.delete(Number(id));
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
