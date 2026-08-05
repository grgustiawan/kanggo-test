import { eq, and, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { IUserRepository } from '../../domain/repository/user.repository';
import type { User, CreateUserInput } from '../../domain/models/user';

export class UserRepository implements IUserRepository {
    async findByEmail(organizationId: number, email: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(and(
                eq(users.organizationId, organizationId),
                eq(users.email, email)
            ))
            .limit(1);

        return result[0] || null;
    }

    async create(input: CreateUserInput): Promise<User> {
        const result = await db
            .insert(users)
            .values({
                organizationId: input.organizationId,
                email: input.email,
                passwordHash: input.passwordHash,
                name: input.name,
                status: input.status || 'active',
                isEmailVerified: input.isEmailVerified || 0,
                createdBy: input.createdBy,
            });

        const insertedId = Number(result[0].insertId);
        const user = await this.findById(insertedId);

        if (!user) {
            throw new Error('Failed to retrieve created user');
        }

        return user;
    }

    async findById(id: number): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return result[0] || null;
    }

    async list(
        organizationId: number,
        search?: string,
        cursor?: string,
        page?: number,
        limit?: number,
        mode?: 'mobile' | 'desktop'
    ): Promise<{ data: User[]; nextCursor?: string | null; total?: number; hasMore?: boolean; page?: number }> {
        const conditions = [eq(users.organizationId, organizationId)];

        if (search) {
            conditions.push(
                or(
                    sql`${users.name} LIKE ${'%' + search + '%'}`,
                    sql`${users.email} LIKE ${'%' + search + '%'}`
                ) as any
            );
        }

        if (mode === 'desktop') {
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(users)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);

            let query = db.select().from(users).where(and(...conditions)).$dynamic();

            const currentPage = page && page > 0 ? page : 1;

            if (limit && limit > 0) {
                const offset = (currentPage - 1) * limit;
                query = query.limit(limit).offset(offset);
            }

            const results = await query;
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
                    sql`${users.createdAt} < ${cursorDate}`,
                    and(
                        sql`${users.createdAt} = ${cursorDate}`,
                        sql`${users.id} < ${cursorId}`
                    )
                );

                if (cursorCondition) {
                    conditions.push(cursorCondition as any);
                }
            }

            const limitVal = limit && limit > 0 ? limit : 20;

            const results = await db
                .select()
                .from(users)
                .where(and(...conditions))
                .orderBy(sql`${users.createdAt} DESC`, sql`${users.id} DESC`)
                .limit(limitVal + 1);

            const hasMore = results.length > limitVal;
            const data = hasMore ? results.slice(0, limitVal) : results;

            let nextCursor: string | null = null;
            if (hasMore && data.length > 0) {
                const lastItem = data[data.length - 1];
                nextCursor = `${lastItem.createdAt.toISOString()}|${lastItem.id}`;
            }

            return { data, nextCursor, hasMore };
        }
    }

    async updateLastLogin(id: number, ip: string): Promise<void> {
        await db
            .update(users)
            .set({
                lastLoginAt: new Date(),
                lastLoginIp: ip,
            })
            .where(eq(users.id, id));
    }

    async update(id: number, data: Partial<User>): Promise<User> {
        await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id));

        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found after update');
        }
        return user;
    }

    async delete(id: number): Promise<void> {
        await db
            .delete(users)
            .where(eq(users.id, id));
    }
}
