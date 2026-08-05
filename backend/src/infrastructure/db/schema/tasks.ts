import { mysqlTable, char, bigint, varchar, mediumtext, mysqlEnum, datetime, timestamp, index, unique, primaryKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';

export const tasks = mysqlTable('tasks', {
  id: char('id', { length: 36 }).notNull().default(sql`(UUID())`),
  organizationId: bigint('organization_id', { mode: 'number', unsigned: true }).notNull().references(() => organizations.id),
  taskNumber: varchar('task_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: mediumtext('description'),
  status: mysqlEnum('status', ['pending', 'in_progress', 'done']).notNull().default('pending'),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']).notNull().default('medium'),
  deadline: datetime('deadline'),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdBy: bigint('created_by', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'set null' }),
  updatedBy: bigint('updated_by', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'set null' }),
  deletedBy: bigint('deleted_by', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'set null' }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.id, table.createdAt] }),
  uqTaskNumber: unique('uq_tasks_number').on(table.organizationId, table.taskNumber, table.createdAt),
  idxOrgStatus: index('idx_tasks_org_status').on(table.organizationId, table.status, table.createdAt),
  idxOrgPriorityStatus: index('idx_tasks_org_priority_status').on(table.organizationId, table.priority, table.status),
  idxUserStatus: index('idx_tasks_user_status').on(table.userId, table.status, table.createdAt),
  idxDeadline: index('idx_tasks_deadline').on(table.organizationId, table.deadline),
  idxDeleted: index('idx_tasks_deleted').on(table.organizationId, table.deletedAt, table.createdAt),
  idxCreated: index('idx_tasks_created').on(table.organizationId, table.createdAt),
}));

export const taskNumberSequences = mysqlTable('task_number_sequences', {
  organizationId: bigint('organization_id', { mode: 'number', unsigned: true }).primaryKey().references(() => organizations.id),
  lastNumber: bigint('last_number', { mode: 'number', unsigned: true }).notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
