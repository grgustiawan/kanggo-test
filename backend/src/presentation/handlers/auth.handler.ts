import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { env } from '../../infrastructure/config/env';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

function getCookieOptions(maxAge: number): CookieOptions {
    const isProduction = env.NODE_ENV === 'production';
    const options: CookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge,
    };
    if (isProduction && env.COOKIE_DOMAIN) {
        options.domain = env.COOKIE_DOMAIN;
    }
    return options;
}

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const user = await authService.register(name, email, password);

        res.status(201).json({ user });
    } catch (error) {
        if (error instanceof Error && error.message === 'Email already registered') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const ip = req.ip || req.socket.remoteAddress || '';

        const result = await authService.login({ email, password }, ip);

        const accessOptions = getCookieOptions(15 * 60 * 1000);
        console.log("Setting access_token with options:", accessOptions);
        res.cookie('access_token', result.accessToken, accessOptions);
        res.cookie('refresh_token', result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.status(200).json({ user: result.user });
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refresh_token;

        if (refreshToken && req.user) {
            const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
            await authService.logout(req.user.userId, decoded.jti);
        }

        const clearOptions = getCookieOptions(0);
        res.clearCookie('access_token', clearOptions);
        res.clearCookie('refresh_token', clearOptions);

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not found' });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        res.cookie('access_token', result.accessToken, getCookieOptions(15 * 60 * 1000));

        res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Refresh token error:', error);
        const clearOptions = getCookieOptions(0);
        res.clearCookie('access_token', clearOptions);
        res.clearCookie('refresh_token', clearOptions);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
