import { mysqlTable, bigint, char, varchar, mysqlEnum, timestamp, unique, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const organizations = mysqlTable('organizations', {
  id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
  uuid: char('uuid', { length: 36 }).notNull().default(sql`(UUID())`),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  status: mysqlEnum('status', ['active', 'suspended', 'inactive']).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  uqSlug: unique('uq_organizations_slug').on(table.slug),
  uqUuid: unique('uq_organizations_uuid').on(table.uuid),
}));
