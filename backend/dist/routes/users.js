"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const queryParser_1 = require("../middleware/queryParser");
const errorHandler_1 = require("../middleware/errorHandler");
const index_1 = require("../index");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use(queryParser_1.parseQuery);
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { pagination, filters, include, flags } = req;
    const where = (0, queryParser_1.buildWhereClause)(filters, {
        isActive: true
    });
    const includeClause = (0, queryParser_1.buildIncludeClause)(include);
    const total = await index_1.prisma.user.count({ where });
    const users = await index_1.prisma.user.findMany({
        where,
        skip: ((pagination.page || 1) - 1) * (pagination.limit || 10),
        take: pagination.limit || 10,
        orderBy: { createdAt: 'desc' },
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
            lastLoginAt: true,
            ...(include.includes('manager') && {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        designation: true
                    }
                }
            }),
            ...(include.includes('subordinates') && {
                subordinates: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                }
            }),
            ...(include.includes('managedprojects') && {
                managedProjects: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                }
            }),
            ...(include.includes('assignments') && {
                assignments: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        }
                    }
                }
            })
        }
    });
    const convertedUsers = users.map(user => ({
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
        notificationSettings: user.notificationSettings || {}
    }));
    if (flags.workload) {
        for (const user of convertedUsers) {
            const assignments = await index_1.prisma.projectAssignment.findMany({
                where: { employeeId: user.id },
                include: {
                    project: {
                        select: { status: true }
                    }
                }
            });
            const initiatives = await index_1.prisma.initiative.findMany({
                where: { assignedTo: user.id, status: { not: 'COMPLETED' } }
            });
            const projectWorkload = assignments
                .filter(a => a.project.status === 'ACTIVE')
                .reduce((sum, a) => sum + a.involvementPercentage, 0);
            const overBeyondWorkload = initiatives
                .reduce((sum, i) => sum + i.workloadPercentage, 0);
            user.workloadData = {
                projectWorkload,
                overBeyondWorkload,
                totalWorkload: projectWorkload + overBeyondWorkload,
                availableCapacity: user.workloadCap - projectWorkload,
                overBeyondAvailable: user.overBeyondCap - overBeyondWorkload
            };
        }
    }
    res.json({
        success: true,
        data: convertedUsers,
        meta: {
            ...(0, queryParser_1.getPaginationMeta)(total, pagination.page || 1, pagination.limit || 10),
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/:id', auth_1.canAccessUser, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { include, flags } = req;
    const user = await index_1.prisma.user.findUnique({
        where: { id },
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
            lastLoginAt: true,
            ...(include.includes('manager') && {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        designation: true
                    }
                }
            }),
            ...(include.includes('subordinates') && {
                subordinates: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                }
            }),
            ...(include.includes('managedprojects') && {
                managedProjects: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                }
            }),
            ...(include.includes('assignments') && {
                assignments: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        }
                    }
                }
            })
        }
    });
    if (!user) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    const convertedUser = {
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
        notificationSettings: user.notificationSettings || {}
    };
    if (flags.workload) {
        const assignments = await index_1.prisma.projectAssignment.findMany({
            where: { employeeId: user.id },
            include: {
                project: {
                    select: { status: true }
                }
            }
        });
        const initiatives = await index_1.prisma.initiative.findMany({
            where: { assignedTo: user.id, status: { not: 'COMPLETED' } }
        });
        const projectWorkload = assignments
            .filter(a => a.project.status === 'ACTIVE')
            .reduce((sum, a) => sum + a.involvementPercentage, 0);
        const overBeyondWorkload = initiatives
            .reduce((sum, i) => sum + i.workloadPercentage, 0);
        convertedUser.workloadData = {
            projectWorkload,
            overBeyondWorkload,
            totalWorkload: projectWorkload + overBeyondWorkload,
            availableCapacity: user.workloadCap - projectWorkload,
            overBeyondAvailable: user.overBeyondCap - overBeyondWorkload
        };
    }
    res.json({
        success: true,
        data: convertedUser,
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { action, id, data } = req.body;
    switch (action) {
        case 'create':
            await handleCreateUser(req, res, data);
            break;
        case 'update':
            await handleUpdateUser(req, res, id, data);
            break;
        case 'delete':
            await handleDeleteUser(req, res, id);
            break;
        case 'activate':
            await handleActivateUser(req, res, id);
            break;
        case 'deactivate':
            await handleDeactivateUser(req, res, id);
            break;
        case 'updateSettings':
            await handleUpdateSettings(req, res, id, data);
            break;
        default:
            throw new errorHandler_1.ValidationError('Invalid action specified');
    }
}));
async function handleCreateUser(req, res, userData) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError('Validation failed');
    }
    const existingUser = await index_1.prisma.user.findUnique({
        where: { email: userData.email }
    });
    if (existingUser) {
        throw new errorHandler_1.ValidationError('User with this email already exists');
    }
    const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
    const user = await index_1.prisma.user.create({
        data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role.toUpperCase(),
            designation: userData.designation,
            managerId: userData.managerId,
            department: userData.department,
            skills: userData.skills || [],
            workloadCap: userData.workloadCap || 100,
            overBeyondCap: userData.overBeyondCap || 20,
            notificationSettings: userData.notificationSettings || {
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
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_CREATED',
            entityType: 'USER',
            entityId: user.id,
            details: `Created user: ${user.name} (${user.email})`
        }
    });
    res.status(201).json({
        success: true,
        data: {
            ...user,
            role: user.role.toLowerCase(),
            managerId: user.managerId || undefined,
            department: user.department || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            notificationSettings: user.notificationSettings || {}
        },
        message: 'User created successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleUpdateUser(req, res, userId, userData) {
    const existingUser = await index_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!existingUser) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    const user = await index_1.prisma.user.update({
        where: { id: userId },
        data: {
            ...(userData.name && { name: userData.name }),
            ...(userData.designation && { designation: userData.designation }),
            ...(userData.managerId !== undefined && { managerId: userData.managerId }),
            ...(userData.department && { department: userData.department }),
            ...(userData.skills && { skills: userData.skills }),
            ...(userData.workloadCap && { workloadCap: userData.workloadCap }),
            ...(userData.overBeyondCap && { overBeyondCap: userData.overBeyondCap }),
            ...(userData.avatar !== undefined && { avatar: userData.avatar }),
            ...(userData.phoneNumber !== undefined && { phoneNumber: userData.phoneNumber }),
            ...(userData.timezone && { timezone: userData.timezone }),
            ...(userData.preferredCurrency && { preferredCurrency: userData.preferredCurrency }),
            ...(userData.notificationSettings && { notificationSettings: userData.notificationSettings })
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
            avatar: true,
            phoneNumber: true,
            timezone: true,
            preferredCurrency: true,
            notificationSettings: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_UPDATED',
            entityType: 'USER',
            entityId: user.id,
            details: `Updated user: ${user.name}`
        }
    });
    res.json({
        success: true,
        data: {
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
            notificationSettings: user.notificationSettings || {}
        },
        message: 'User updated successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleDeleteUser(req, res, userId) {
    const existingUser = await index_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!existingUser) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    await index_1.prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_DELETED',
            entityType: 'USER',
            entityId: userId,
            details: `Deleted user: ${existingUser.name}`
        }
    });
    res.json({
        success: true,
        message: 'User deleted successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleActivateUser(req, res, userId) {
    const user = await index_1.prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_ACTIVATED',
            entityType: 'USER',
            entityId: userId,
            details: `Activated user: ${user.name}`
        }
    });
    res.json({
        success: true,
        message: 'User activated successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleDeactivateUser(req, res, userId) {
    const user = await index_1.prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_DEACTIVATED',
            entityType: 'USER',
            entityId: userId,
            details: `Deactivated user: ${user.name}`
        }
    });
    res.json({
        success: true,
        message: 'User deactivated successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleUpdateSettings(req, res, userId, settings) {
    const user = await index_1.prisma.user.update({
        where: { id: userId },
        data: {
            notificationSettings: settings.notificationSettings,
            ...(settings.timezone && { timezone: settings.timezone }),
            ...(settings.preferredCurrency && { preferredCurrency: settings.preferredCurrency })
        }
    });
    res.json({
        success: true,
        message: 'Settings updated successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
exports.default = router;
//# sourceMappingURL=users.js.map