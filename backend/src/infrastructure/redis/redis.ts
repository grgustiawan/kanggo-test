import Redis from 'ioredis';
import Redlock from 'redlock';
import { env } from '../config/env';

export const redis = new Redis(env.REDIS_URL);

redis.on('error', (err) => {
    console.error('DragonflyDB Client Error', err);
});

redis.on('connect', () => {
    console.log('DragonflyDB Client Connected');
});

export const redlock = new Redlock(
    [redis],
    {
        driftFactor: 0.01,
        retryCount: 10,
        retryDelay: 200,
        retryJitter: 200,
    }
);
