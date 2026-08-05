import { redis } from '../../infrastructure/redis/redis';
import crypto from 'crypto';

export class CacheService {
    async get<T>(key: string): Promise<T | null> {
        const cached = await redis.get(key);
        if (!cached) return null;
        try {
            return JSON.parse(cached) as T;
        } catch {
            return null;
        }
    }

    async set(key: string, data: unknown, ttlSeconds = 300): Promise<void> {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    }

    async invalidatePattern(pattern: string): Promise<void> {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== '0');
    }

    buildSearchKey(orgId: number, params: Record<string, any>): string {
        const hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
        return `task:search:${orgId}:${hash}`;
    }
}
