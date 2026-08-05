import { mysqlTable, int, bigint, smallint, varchar, tinyint, timestamp, unique, index, primaryKey } from 'drizzle-orm/mysql-core';
import { organizations } from './organizations';
import { users } from './users';

export const roles = mysqlTable('roles', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),
  organizationId: bigint('organization_id', { mode: 'number', unsigned: true }).references(() => organizations.id),
  code: varchar('code', { length: 60 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  isSystem: tinyint('is_system').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  uqOrgCode: unique('uq_roles_org_code').on(table.organizationId, table.code),
}));

export const permissions = mysqlTable('permissions', {
  id: smallint('id', { unsigned: true }).primaryKey().autoincrement(),
  code: varchar('code', { length: 100 }).notNull(),
  module: varchar('module', { length: 60 }).notNull(),
  description: varchar('description', { length: 255 }),
}, (table) => ({
  uqCode: unique('uq_permissions_code').on(table.code),
}));

export const rolePermissions = mysqlTable('role_permissions', {
  roleId: int('role_id', { unsigned: true }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: smallint('permission_id', { unsigned: true }).notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

export const userRoles = mysqlTable('user_roles', {
  userId: bigint('user_id', { mode: 'number', unsigned: true }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: int('role_id', { unsigned: true }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  organizationId: bigint('organization_id', { mode: 'number', unsigned: true }).notNull(),
  assignedBy: bigint('assigned_by', { mode: 'number', unsigned: true }),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
  idxOrg: index('idx_user_roles_org').on(table.organizationId),
}));
