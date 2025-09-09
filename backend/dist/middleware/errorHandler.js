"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.notFoundHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details = undefined;
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });
    if ('statusCode' in error && error.statusCode) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                statusCode = 409;
                message = 'A record with this data already exists';
                details = { field: error.meta?.target };
                break;
            case 'P2025':
                statusCode = 404;
                message = 'Record not found';
                break;
            case 'P2003':
                statusCode = 400;
                message = 'Invalid reference to related record';
                break;
            case 'P2014':
                statusCode = 400;
                message = 'Invalid ID provided';
                break;
            default:
                statusCode = 400;
                message = 'Database operation failed';
                details = { code: error.code };
        }
    }
    else if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        message = 'Database connection error';
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        details = error.message;
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        message = 'File upload error';
        details = error.message;
    }
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Something went wrong';
        details = undefined;
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            timestamp: new Date().toISOString()
        })
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
};
exports.notFoundHandler = notFoundHandler;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.isOperational = true;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.statusCode = 404;
        this.isOperational = true;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.statusCode = 401;
        this.isOperational = true;
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor(message = 'Forbidden') {
        super(message);
        this.statusCode = 403;
        this.isOperational = true;
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends Error {
    constructor(message = 'Conflict') {
        super(message);
        this.statusCode = 409;
        this.isOperational = true;
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map