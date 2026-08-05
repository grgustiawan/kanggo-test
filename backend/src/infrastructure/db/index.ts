import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../config/env";
import * as schema from "./schema";

export const pool = mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: 100,
    maxIdle: 100,
    idleTimeout: 60000,
    queueLimit: 0,
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    decimalNumbers: true,
    supportBigNumbers: true,
    multipleStatements: false,
});

export const db = drizzle(pool, {
    schema,
    mode: 'default',
});