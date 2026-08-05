import rateLimit from 'express-rate-limit';
import { RedisStore, type SendCommandFn } from 'rate-limit-redis';
import { redis } from '../../infrastructure/redis/redis';

const sendCommand: SendCommandFn = async (...args: string[]) => {
    const [command, ...rest] = args;
    return redis.call(command, ...rest) as never;
};

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({ sendCommand }),
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

export const strictApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    store: new RedisStore({ sendCommand }),
});
