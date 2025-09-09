"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockDb_1 = require("../services/mockDb");
const router = express_1.default.Router();
const mockAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    next();
};
router.use(mockAuth);
router.get('/', async (req, res) => {
    try {
        const users = await mockDb_1.mockDb.getAllUsers();
        const safeUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            designation: user.designation,
            department: user.department,
            skills: user.skills,
            workloadCap: user.workloadCap,
            overBeyondCap: user.overBeyondCap,
            preferredCurrency: user.preferredCurrency,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt
        }));
        res.json({
            success: true,
            data: safeUsers,
            meta: {
                total: safeUsers.length,
                page: 1,
                limit: safeUsers.length
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await mockDb_1.mockDb.findUserById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            designation: user.designation,
            department: user.department,
            skills: user.skills,
            workloadCap: user.workloadCap,
            overBeyondCap: user.overBeyondCap,
            preferredCurrency: user.preferredCurrency,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt
        };
        res.json({
            success: true,
            data: safeUser
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=mock-users.js.map