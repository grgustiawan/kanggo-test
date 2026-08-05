import { eq, and, isNull, lt, or, desc, sql } from 'drizzle-orm';
import { db, pool } from '../db';
import { tasks, users } from '../db/schema';
import type { ITaskRepository } from '../../domain/repository/task.repository';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskListQuery } from '../../domain/models/task';
import type { RowDataPacket } from 'mysql2/promise';

export class TaskRepository implements ITaskRepository {
    async create(input: CreateTaskInput): Promise<Task> {
        const connection = await pool.getConnection();

        try {
            await connection.query('SET @task_id = NULL');
            await connection.query('SET @task_number = NULL');

            await connection.query(
                'CALL sp_create_task(?, ?, ?, ?, ?, ?, ?, @task_id, @task_number)',
                [
                    input.organizationId,
                    input.title,
                    input.description || null,
                    input.priority || 'medium',
                    input.deadline || null,
                    input.userId,
                    input.createdBy,
                ]
            );

            const [rows] = await connection.query<RowDataPacket[]>(
                'SELECT @task_id as taskId, @task_number as taskNumber'
            );

            const taskId = rows[0].taskId;

            if (!taskId) {
                throw new Error('Failed to create task');
            }

            const task = await this.findById(taskId);

            if (!task) {
                throw new Error('Failed to retrieve created task');
            }

            return task;
        } finally {
            connection.release();
        }
    }

    async findById(id: string): Promise<Task | null> {
        const result = await db
            .select()
            .from(tasks)
            .where(and(
                eq(tasks.id, id),
                isNull(tasks.deletedAt)
            ))
            .limit(1);

        return result[0] || null;
    }

    async update(id: string, input: UpdateTaskInput): Promise<Task> {
        await db
            .update(tasks)
            .set({
                title: input.title,
                description: input.description,
                status: input.status,
                priority: input.priority,
                deadline: input.deadline,
                updatedBy: input.updatedBy,
                updatedAt: new Date(),
            })
            .where(eq(tasks.id, id));

        const task = await this.findById(id);

        if (!task) {
            throw new Error('Task not found after update');
        }

        return task;
    }

    async softDelete(id: string, deletedBy: number): Promise<void> {
        await db
            .update(tasks)
            .set({
                deletedAt: new Date(),
                deletedBy,
            })
            .where(eq(tasks.id, id));
    }

    async list(query: TaskListQuery): Promise<{ data: any[], nextCursor?: string | null, total?: number, hasMore?: boolean, page?: number }> {
        const { organizationId, status, search, cursor, page, limit, mode } = query;

        let conditions = [
            eq(tasks.organizationId, organizationId),
            isNull(tasks.deletedAt)
        ];

        if (status) {
            conditions.push(eq(tasks.status, status));
        }

        if (search) {
            conditions.push(
                sql`MATCH(${tasks.title}) AGAINST(${search} IN BOOLEAN MODE)`
            );
        }

        if (mode === 'desktop') {
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(tasks)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);

            let queryBuilder = db
                .select({
                    task: tasks,
                    userName: users.name
                })
                .from(tasks)
                .leftJoin(users, eq(tasks.userId, users.id))
                .where(and(...conditions))
                .orderBy(desc(tasks.createdAt), desc(tasks.id));

            const currentPage = page && page > 0 ? page : 1;
            
            if (limit && limit > 0) {
                const offset = (currentPage - 1) * limit;
                queryBuilder = queryBuilder.limit(limit).offset(offset) as any;
            }

            const rawResults = await queryBuilder;
            
            const results = rawResults.map(row => ({
                ...row.task,
                userName: row.userName
            }));

            const effectiveLimit = limit && limit > 0 ? limit : total;
            const hasMore = currentPage * effectiveLimit < total;

            return {
                data: results,
                total,
                hasMore,
                page: currentPage,
            };
        } else {
            if (cursor) {
                const [cursorCreatedAt, cursorId] = cursor.split('|');
                const cursorDate = new Date(cursorCreatedAt);

                const cursorCondition = or(
                    lt(tasks.createdAt, cursorDate),
                    and(
                        eq(tasks.createdAt, cursorDate),
                        lt(tasks.id, cursorId)
                    )
                );

                if (cursorCondition) {
                    conditions.push(cursorCondition);
                }
            }

            const rawResults = await db
                .select({
                    task: tasks,
                    userName: users.name
                })
                .from(tasks)
                .leftJoin(users, eq(tasks.userId, users.id))
                .where(and(...conditions))
                .orderBy(desc(tasks.createdAt), desc(tasks.id))
                .limit(limit + 1);

            const results = rawResults.map(row => ({
                ...row.task,
                userName: row.userName
            }));

            const hasMore = results.length > limit;
            const data = hasMore ? results.slice(0, limit) : results;

            let nextCursor: string | null = null;
            if (hasMore && data.length > 0) {
                const lastItem = data[data.length - 1];
                nextCursor = `${lastItem.createdAt.toISOString()}|${lastItem.id}`;
            }

            return { data, nextCursor, hasMore };
        }
    }
}
