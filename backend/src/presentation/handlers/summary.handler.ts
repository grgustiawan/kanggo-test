import type { Request, Response } from 'express';
import { db } from '../../infrastructure/db';
import { users, tasks } from '../../infrastructure/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export const getSummary = async (req: Request, res: Response) => {
    try {
        const organizationId = 1;

        const totalUsersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(
                and(
                    eq(users.organizationId, organizationId),
                    eq(users.status, 'active'),
                    isNull(users.deletedAt)
                )
            );

        const tasksPendingResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(
                and(
                    eq(tasks.organizationId, organizationId),
                    eq(tasks.status, 'pending'),
                    isNull(tasks.deletedAt)
                )
            );

        const tasksInProgressResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(
                and(
                    eq(tasks.organizationId, organizationId),
                    eq(tasks.status, 'in_progress'),
                    isNull(tasks.deletedAt)
                )
            );

        const tasksDoneResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(
                and(
                    eq(tasks.organizationId, organizationId),
                    eq(tasks.status, 'done'),
                    isNull(tasks.deletedAt)
                )
            );

        const totalTasksResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(
                and(
                    eq(tasks.organizationId, organizationId),
                    isNull(tasks.deletedAt)
                )
            );

        const recentTasksResult = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                status: tasks.status,
                assigneeName: users.name,
                createdAt: tasks.createdAt,
            })
            .from(tasks)
            .innerJoin(users, eq(tasks.userId, users.id))
            .where(
                and(
                    eq(tasks.organizationId, organizationId),
                    isNull(tasks.deletedAt)
                )
            )
            .orderBy(sql`${tasks.createdAt} DESC`)
            .limit(4);

        const summary = {
            totalUsers: Number(totalUsersResult[0]?.count || 0),
            totalTasks: Number(totalTasksResult[0]?.count || 0),
            tasksByStatus: {
                pending: Number(tasksPendingResult[0]?.count || 0),
                in_progress: Number(tasksInProgressResult[0]?.count || 0),
                done: Number(tasksDoneResult[0]?.count || 0),
            },
            recentTasks: recentTasksResult.map(task => ({
                id: task.id,
                title: task.title,
                status: task.status,
                assigneeName: task.assigneeName,
                createdAt: task.createdAt,
            })),
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
