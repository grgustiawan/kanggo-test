import { mysqlTable, bigint, varchar, mysqlEnum, json, datetime, date, text, timestamp, index, primaryKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const auditLogs = mysqlTable('audit_logs', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement(),
  organizationId: bigint('organization_id', { mode: 'number', unsigned: true }).notNull(),
  entityType: varchar('entity_type', { length: 60 }).notNull(),
  entityId: varchar('entity_id', { length: 36 }).notNull(),
  action: mysqlEnum('action', ['insert', 'update', 'delete', 'restore']).notNull(),
  actorId: bigint('actor_id', { mode: 'number', unsigned: true }),
  actorIp: varchar('actor_ip', { length: 45 }),
  oldValues: json('old_values'),
  newValues: json('new_values'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  pk: primaryKey({ columns: [table.id, table.createdAt] }),
  idxEntity: index('idx_audit_entity').on(table.entityType, table.entityId, table.createdAt),
  idxOrg: index('idx_audit_org').on(table.organizationId, table.createdAt),
  idxActor: index('idx_audit_actor').on(table.actorId, table.createdAt),
}));

export const partitionMaintenanceLog = mysqlTable('partition_maintenance_log', {
  id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
  tableName: varchar('table_name', { length: 64 }).notNull(),
  partitionName: varchar('partition_name', { length: 64 }).notNull(),
  boundaryDate: date('boundary_date').notNull(),
  executedSql: text('executed_sql').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  idxTable: index('idx_pml_table').on(table.tableName, table.createdAt),
}));
