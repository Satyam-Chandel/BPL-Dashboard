"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const index_1 = require("../index");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('name').isLength({ min: 2 }),
    (0, express_validator_1.body)('role').isIn(['admin', 'program_manager', 'rd_manager', 'manager', 'employee']),
    (0, express_validator_1.body)('designation').isLength({ min: 2 })
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: 'Invalid input',
            details: errors.array()
        });
        return;
    }
    const { email, password, name, role, designation, managerId, department } = req.body;
    const existingUser = await index_1.prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        res.status(409).json({
            success: false,
            error: 'User with this email already exists'
        });
        return;
    }
    if (managerId) {
        const manager = await index_1.prisma.user.findUnique({
            where: { id: managerId }
        });
        if (!manager) {
            res.status(400).json({
                success: false,
                error: 'Invalid manager ID'
            });
            return;
        }
    }
    const saltRounds = 12;
    const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
    const user = await index_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: role.toUpperCase(),
            designation,
            managerId,
            department,
            skills: [],
            workloadCap: 100,
            overBeyondCap: 20,
            notificationSettings: {
                email: true,
                inApp: true,
                projectUpdates: true,
                deadlineReminders: true,
                weeklyReports: false
            }
        },
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
            notificationSettings: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        role: user.role
    }, jwtSecret, { expiresIn: '24h' });
    await index_1.prisma.activityLog.create({
        data: {
            userId: user.id,
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: user.id,
            details: `User registered: ${user.name} (${user.email})`
        }
    });
    await index_1.prisma.notification.create({
        data: {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Welcome to BPL Commander!',
            message: 'Your account has been created successfully. Complete your profile to get started.',
            priority: 'MEDIUM',
            actionUrl: '/profile'
        }
    });
    res.status(201).json({
        success: true,
        data: {
            user: {
                ...user,
                role: user.role.toLowerCase(),
                managerId: user.managerId || undefined,
                department: user.department || undefined,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                notificationSettings: user.notificationSettings || {}
            },
            token,
            expiresIn: 24 * 60 * 60
        },
        message: 'User registered successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: 'Invalid input',
            details: errors.array()
        });
        return;
    }
    const { email, password } = req.body;
    const user = await index_1.prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
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
            error: 'Invalid credentials or inactive account'
        });
        return;
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        role: user.role
    }, jwtSecret, { expiresIn: '24h' });
    await index_1.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: {
            user: {
                ...userWithoutPassword,
                role: user.role.toLowerCase(),
                managerId: user.managerId || undefined,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                lastLoginAt: new Date().toISOString(),
                notificationSettings: user.notificationSettings || {}
            },
            token,
            expiresIn: 24 * 60 * 60
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.post('/logout', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'User not found'
        });
        return;
    }
    res.json({
        success: true,
        data: req.user,
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.post('/refresh', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'User not found'
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    const token = jsonwebtoken_1.default.sign({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
    }, jwtSecret, { expiresIn: '24h' });
    res.json({
        success: true,
        data: {
            token,
            expiresIn: 24 * 60 * 60
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.post('/change-password', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('currentPassword').isLength({ min: 6 }),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 })
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: 'Invalid input',
            details: errors.array()
        });
        return;
    }
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'User not found'
        });
        return;
    }
    const { currentPassword, newPassword } = req.body;
    const user = await index_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password: true }
    });
    if (!user) {
        res.status(404).json({
            success: false,
            error: 'User not found'
        });
        return;
    }
    const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        res.status(400).json({
            success: false,
            error: 'Current password is incorrect'
        });
        return;
    }
    const saltRounds = 12;
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
    await index_1.prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword }
    });
    res.json({
        success: true,
        message: 'Password changed successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map