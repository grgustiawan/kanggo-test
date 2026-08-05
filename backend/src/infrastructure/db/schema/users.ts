import { mysqlTable, bigint, varchar, mysqlEnum, timestamp, tinyint, unique, index } from 'drizzle-orm/mysql-core';
import { organizations } from './organizations';

export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
  organizationId: bigint('organization_id', { mode: 'number', unsigned: true }).notNull().references(() => organizations.id),
  email: varchar('email', { length: 190 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  status: mysqlEnum('status', ['active', 'inactive', 'suspended', 'deleted']).notNull().default('active'),
  isEmailVerified: tinyint('is_email_verified').notNull().default(1),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  createdBy: bigint('created_by', { mode: 'number', unsigned: true }),
  updatedBy: bigint('updated_by', { mode: 'number', unsigned: true }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  uqOrgEmail: unique('uq_users_org_email').on(table.organizationId, table.email),
  idxOrg: index('idx_users_org').on(table.organizationId),
  idxStatus: index('idx_users_status').on(table.status),
}));
