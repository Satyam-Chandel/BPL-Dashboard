"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.canManageProjects = exports.canAccessUser = exports.authorize = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required'
            });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await index_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                designation: true,
                managerId: true,
                department: true,
                skills: true,
                workloadCap: true,
                overBeyondCap: true,
                avatar: true,
                phoneNumber: true,
                timezone: true,
                preferredCurrency: true,
                notificationSettings: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true
            }
        });
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                error: 'Invalid or inactive user'
            });
            return;
        }
        req.user = {
            ...user,
            role: user.role.toLowerCase(),
            managerId: user.managerId || undefined,
            department: user.department || undefined,
            avatar: user.avatar || undefined,
            phoneNumber: user.phoneNumber || undefined,
            timezone: user.timezone || undefined,
            preferredCurrency: user.preferredCurrency || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
            notificationSettings: user.notificationSettings
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }
        else {
            console.error('Authentication error:', error);
            res.status(500).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    }
};
exports.authenticateToken = authenticateToken;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const canAccessUser = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
        return;
    }
    const targetUserId = req.params.id || req.body.userId || req.query.userId;
    if (req.user.role === 'admin') {
        next();
        return;
    }
    if (req.user.id === targetUserId) {
        next();
        return;
    }
    if (['program_manager', 'rd_manager', 'manager'].includes(req.user.role)) {
        next();
        return;
    }
    res.status(403).json({
        success: false,
        error: 'Access denied'
    });
};
exports.canAccessUser = canAccessUser;
const canManageProjects = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
        return;
    }
    const allowedRoles = ['admin', 'program_manager', 'rd_manager', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            error: 'Only managers and above can manage projects'
        });
        return;
    }
    next();
};
exports.canManageProjects = canManageProjects;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token && process.env.JWT_SECRET) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await index_1.prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (user && user.isActive) {
                req.user = {
                    ...user,
                    role: user.role.toLowerCase(),
                    managerId: user.managerId || undefined,
                    department: user.department || undefined,
                    avatar: user.avatar || undefined,
                    phoneNumber: user.phoneNumber || undefined,
                    timezone: user.timezone || undefined,
                    preferredCurrency: user.preferredCurrency || undefined,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                    lastLoginAt: user.lastLoginAt?.toISOString(),
                    notificationSettings: user.notificationSettings
                };
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map