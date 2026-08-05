import type { Request, Response, NextFunction } from 'express';

export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRoles = req.user.roles || [];

        const hasPermission = allowedRoles.some(role => userRoles.includes(role));

        if (!hasPermission) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'You do not have permission to access this resource' 
            });
        }

        next();
    };
};
