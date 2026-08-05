import argon2 from 'argon2';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { IUserRepository } from '../../domain/repository/user.repository';
import type { LoginInput } from '../../domain/models/user';
import type { AuthTokens, TokenPayload } from '../../domain/models/auth';
import { env } from '../../infrastructure/config/env';
import { redis } from '../../infrastructure/redis/redis';
import { db } from '../../infrastructure/db';
import { userRoles, roles } from '../../infrastructure/db/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
    constructor(private userRepository: IUserRepository) {}

    async register(name: string, email: string, password: string) {
        const organizationId = 1;

        const existingUser = await this.userRepository.findByEmail(organizationId, email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const passwordHash = await argon2.hash(password);

        const user = await this.userRepository.create({
            organizationId,
            email,
            passwordHash,
            name,
            status: 'active',
            isEmailVerified: 0,
        });

        const userRole = await db
            .select()
            .from(roles)
            .where(eq(roles.code, 'user'))
            .limit(1);

        if (userRole[0]) {
            await db.insert(userRoles).values({
                userId: user.id,
                roleId: userRole[0].id,
                organizationId: user.organizationId,
                assignedAt: new Date(),
            });
        }

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(input: LoginInput, ip: string): Promise<AuthTokens & { user: any }> {
        const organizationId = 1;

        const user = await this.userRepository.findByEmail(organizationId, input.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await argon2.verify(user.passwordHash, input.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const userRolesResult = await db
            .select({
                roleCode: roles.code,
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, user.id));

        const roleCodes = userRolesResult.map(r => r.roleCode);

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            organizationId: user.organizationId,
            roles: roleCodes,
        };

        const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
        });

        const refreshJti = randomUUID();
        const refreshToken = jwt.sign(
            { ...payload, jti: refreshJti },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] }
        );

        await redis.set(`rt:${user.id}:${refreshJti}`, 'valid', 'EX', 604800);

        await this.userRepository.updateLastLogin(user.id, ip);

        const { passwordHash: _, ...userWithoutPassword } = user;

        return { accessToken, refreshToken, user: { ...userWithoutPassword, roles: roleCodes } };
    }

    async logout(userId: number, refreshJti: string): Promise<void> {
        await redis.del(`rt:${userId}:${refreshJti}`);
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload & { jti: string };
            
            const isValid = await redis.get(`rt:${decoded.userId}:${decoded.jti}`);
            if (!isValid) {
                throw new Error('Invalid refresh token');
            }

            const payload: TokenPayload = {
                userId: decoded.userId,
                email: decoded.email,
                organizationId: decoded.organizationId,
            };

            const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
                expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
            });

            return { accessToken };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}
