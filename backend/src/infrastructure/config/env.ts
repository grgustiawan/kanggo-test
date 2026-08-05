import { config } from 'dotenv';
config();

export const env = {
    PORT: process.env.APP_PORT || 3000,
    NODE_ENV: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/task_management_system',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'change-this-access-secret-in-production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '.awanbox.biz.id',
};
