import { Request, Response, NextFunction } from 'express';
import { User } from '../../../shared/types';
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const canAccessUser: (req: Request, res: Response, next: NextFunction) => void;
export declare const canManageProjects: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map