import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (error: AppError | Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare class ValidationError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string);
}
export declare class NotFoundError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message?: string);
}
export declare class UnauthorizedError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message?: string);
}
export declare class ForbiddenError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message?: string);
}
export declare class ConflictError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message?: string);
}
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map