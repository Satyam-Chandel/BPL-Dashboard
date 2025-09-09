"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const queryParser_1 = require("../middleware/queryParser");
const errorHandler_1 = require("../middleware/errorHandler");
const index_1 = require("../index");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use(queryParser_1.parseQuery);
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { pagination, filters, include, flags, parsedQuery } = req;
    let where = (0, queryParser_1.buildWhereClause)(filters);
    if (req.user.role === 'manager') {
        where = {
            ...where,
            OR: [
                { managerId: req.user.id },
                { assignments: { some: { employeeId: req.user.id } } }
            ]
        };
    }
    else if (req.user.role === 'employee') {
        where = {
            ...where,
            assignments: { some: { employeeId: req.user.id } }
        };
    }
    if (parsedQuery.manager) {
        where.managerId = parsedQuery.manager;
    }
    const total = await index_1.prisma.project.count({ where });
    const projects = await index_1.prisma.project.findMany({
        where,
        include: {
            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    designation: true
                }
            },
            assignments: {
                include: {
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            designation: true
                        }
                    }
                }
            },
            milestones: {
                orderBy: { dueDate: 'asc' }
            },
            comments: include.includes('comments') ? {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            } : false,
            _count: {
                select: {
                    assignments: true,
                    milestones: true,
                    comments: true
                }
            }
        },
        skip: ((pagination.page || 1) - 1) * (pagination.limit || 10),
        take: pagination.limit || 10,
        orderBy: { updatedAt: 'desc' }
    });
    const convertedProjects = projects.map(project => ({
        ...project,
        status: project.status.toLowerCase(),
        priority: project.priority.toLowerCase(),
        budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : undefined,
        timeline: project.timeline || undefined,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        lastActivity: project.updatedAt.toISOString(),
        assignments: project.assignments?.map(assignment => ({
            ...assignment,
            assignedAt: assignment.assignedAt.toISOString(),
            updatedAt: assignment.updatedAt.toISOString(),
            employee: assignment.employee
        })),
        milestones: project.milestones?.map(milestone => ({
            ...milestone,
            dueDate: milestone.dueDate.toISOString(),
            completedAt: milestone.completedAt?.toISOString(),
            createdAt: milestone.createdAt.toISOString(),
            updatedAt: milestone.updatedAt.toISOString()
        })),
        comments: project.comments?.map(comment => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        }))
    }));
    if (flags.analytics) {
        const analytics = await calculateProjectAnalytics(where);
        res.json({
            success: true,
            data: convertedProjects,
            analytics,
            meta: {
                ...(0, queryParser_1.getPaginationMeta)(total, pagination.page || 1, pagination.limit || 10),
                timestamp: new Date().toISOString()
            }
        });
        return;
    }
    res.json({
        success: true,
        data: convertedProjects,
        meta: {
            ...(0, queryParser_1.getPaginationMeta)(total, pagination.page || 1, pagination.limit || 10),
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { include, flags } = req;
    const project = await index_1.prisma.project.findUnique({
        where: { id },
        include: {
            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    designation: true
                }
            },
            assignments: {
                include: {
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            designation: true,
                            avatar: true
                        }
                    }
                }
            },
            milestones: {
                orderBy: { dueDate: 'asc' }
            },
            comments: include.includes('comments') ? {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            } : false,
            versions: include.includes('versions') ? {
                orderBy: { createdAt: 'desc' },
                take: 10
            } : false
        }
    });
    if (!project) {
        throw new errorHandler_1.NotFoundError('Project not found');
    }
    const hasAccess = req.user.role === 'admin' ||
        req.user.role === 'program_manager' ||
        req.user.role === 'rd_manager' ||
        project.managerId === req.user.id ||
        project.assignments.some(a => a.employeeId === req.user.id);
    if (!hasAccess) {
        throw new errorHandler_1.NotFoundError('Project not found');
    }
    const convertedProject = {
        ...project,
        status: project.status.toLowerCase(),
        priority: project.priority.toLowerCase(),
        budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : undefined,
        timeline: project.timeline || undefined,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        lastActivity: project.updatedAt.toISOString(),
        assignments: project.assignments?.map(assignment => ({
            ...assignment,
            assignedAt: assignment.assignedAt.toISOString(),
            updatedAt: assignment.updatedAt.toISOString(),
            employee: assignment.employee
        })),
        milestones: project.milestones?.map(milestone => ({
            ...milestone,
            dueDate: milestone.dueDate.toISOString(),
            completedAt: milestone.completedAt?.toISOString(),
            createdAt: milestone.createdAt.toISOString(),
            updatedAt: milestone.updatedAt.toISOString()
        })),
        comments: project.comments?.map(comment => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        })),
        versions: project.versions?.map(version => ({
            ...version,
            createdAt: version.createdAt.toISOString()
        }))
    };
    res.json({
        success: true,
        data: convertedProject,
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { action, id, data } = req.body;
    switch (action) {
        case 'create':
            await handleCreateProject(req, res, data);
            break;
        case 'update':
            await handleUpdateProject(req, res, id, data);
            break;
        case 'delete':
            await handleDeleteProject(req, res, id);
            break;
        case 'assign':
            await handleAssignEmployee(req, res, id, data);
            break;
        case 'unassign':
            await handleUnassignEmployee(req, res, id, data);
            break;
        case 'milestone':
            await handleMilestoneAction(req, res, id, data);
            break;
        case 'comment':
            await handleAddComment(req, res, id, data);
            break;
        case 'complete':
            await handleCompleteProject(req, res, id);
            break;
        case 'activate':
            await handleActivateProject(req, res, id);
            break;
        default:
            throw new errorHandler_1.ValidationError('Invalid action specified');
    }
}));
async function handleCreateProject(req, res, projectData) {
    if (!['admin', 'program_manager', 'rd_manager', 'manager'].includes(req.user.role)) {
        throw new errorHandler_1.ValidationError('Insufficient permissions to create projects');
    }
    const project = await index_1.prisma.project.create({
        data: {
            title: projectData.title,
            description: projectData.description,
            managerId: req.user.id,
            priority: projectData.priority?.toUpperCase() || 'MEDIUM',
            estimatedHours: projectData.estimatedHours,
            budgetAmount: projectData.budgetAmount,
            budgetCurrency: projectData.budgetCurrency || 'USD',
            timeline: projectData.timeline,
            tags: projectData.tags || []
        },
        include: {
            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'PROJECT_CREATED',
            entityType: 'PROJECT',
            entityId: project.id,
            projectId: project.id,
            details: `Created project: ${project.title}`
        }
    });
    res.status(201).json({
        success: true,
        data: {
            ...project,
            status: project.status.toLowerCase(),
            priority: project.priority.toLowerCase(),
            budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : undefined,
            timeline: project.timeline || undefined,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString()
        },
        message: 'Project created successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleUpdateProject(req, res, projectId, projectData) {
    const existingProject = await index_1.prisma.project.findUnique({
        where: { id: projectId }
    });
    if (!existingProject) {
        throw new errorHandler_1.NotFoundError('Project not found');
    }
    const canUpdate = req.user.role === 'admin' ||
        req.user.role === 'program_manager' ||
        req.user.role === 'rd_manager' ||
        existingProject.managerId === req.user.id;
    if (!canUpdate) {
        throw new errorHandler_1.ValidationError('Insufficient permissions to update this project');
    }
    await index_1.prisma.projectVersion.create({
        data: {
            projectId: projectId,
            version: existingProject.version,
            snapshot: existingProject,
            changedBy: req.user.id,
            changeType: 'UPDATE'
        }
    });
    const project = await index_1.prisma.project.update({
        where: { id: projectId },
        data: {
            ...(projectData.title && { title: projectData.title }),
            ...(projectData.description !== undefined && { description: projectData.description }),
            ...(projectData.status && { status: projectData.status.toUpperCase() }),
            ...(projectData.priority && { priority: projectData.priority.toUpperCase() }),
            ...(projectData.estimatedHours !== undefined && { estimatedHours: projectData.estimatedHours }),
            ...(projectData.budgetAmount !== undefined && { budgetAmount: projectData.budgetAmount }),
            ...(projectData.budgetCurrency && { budgetCurrency: projectData.budgetCurrency }),
            ...(projectData.timeline !== undefined && { timeline: projectData.timeline }),
            ...(projectData.tags && { tags: projectData.tags }),
            version: { increment: 1 }
        },
        include: {
            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'PROJECT_UPDATED',
            entityType: 'PROJECT',
            entityId: project.id,
            projectId: project.id,
            details: `Updated project: ${project.title}`
        }
    });
    res.json({
        success: true,
        data: {
            ...project,
            status: project.status.toLowerCase(),
            priority: project.priority.toLowerCase(),
            budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : undefined,
            timeline: project.timeline || undefined,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString()
        },
        message: 'Project updated successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleAssignEmployee(req, res, projectId, assignmentData) {
    const project = await index_1.prisma.project.findUnique({
        where: { id: projectId }
    });
    if (!project) {
        throw new errorHandler_1.NotFoundError('Project not found');
    }
    const employee = await index_1.prisma.user.findUnique({
        where: { id: assignmentData.employeeId }
    });
    if (!employee) {
        throw new errorHandler_1.NotFoundError('Employee not found');
    }
    const existingAssignment = await index_1.prisma.projectAssignment.findUnique({
        where: {
            projectId_employeeId: {
                projectId: projectId,
                employeeId: assignmentData.employeeId
            }
        }
    });
    if (existingAssignment) {
        throw new errorHandler_1.ValidationError('Employee is already assigned to this project');
    }
    const currentAssignments = await index_1.prisma.projectAssignment.findMany({
        where: { employeeId: assignmentData.employeeId },
        include: {
            project: {
                select: { status: true }
            }
        }
    });
    const currentWorkload = currentAssignments
        .filter(a => a.project.status === 'ACTIVE')
        .reduce((sum, a) => sum + a.involvementPercentage, 0);
    if (currentWorkload + assignmentData.involvementPercentage > employee.workloadCap) {
        throw new errorHandler_1.ValidationError(`Assignment would exceed employee's workload capacity (${employee.workloadCap}%)`);
    }
    const assignment = await index_1.prisma.projectAssignment.create({
        data: {
            projectId: projectId,
            employeeId: assignmentData.employeeId,
            involvementPercentage: assignmentData.involvementPercentage,
            role: assignmentData.role
        },
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    designation: true
                }
            }
        }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_ASSIGNED',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId: projectId,
            details: `Assigned ${employee.name} to project with ${assignmentData.involvementPercentage}% involvement`
        }
    });
    await index_1.prisma.notification.create({
        data: {
            userId: assignmentData.employeeId,
            type: 'ASSIGNMENT',
            title: 'New Project Assignment',
            message: `You have been assigned to project: ${project.title}`,
            entityType: 'PROJECT',
            entityId: projectId,
            priority: 'MEDIUM',
            actionUrl: `/projects/${projectId}`
        }
    });
    res.json({
        success: true,
        data: {
            ...assignment,
            assignedAt: assignment.assignedAt.toISOString(),
            updatedAt: assignment.updatedAt.toISOString()
        },
        message: 'Employee assigned successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleUnassignEmployee(req, res, projectId, data) {
    const assignment = await index_1.prisma.projectAssignment.findUnique({
        where: {
            projectId_employeeId: {
                projectId: projectId,
                employeeId: data.employeeId
            }
        },
        include: {
            employee: {
                select: { name: true }
            }
        }
    });
    if (!assignment) {
        throw new errorHandler_1.NotFoundError('Assignment not found');
    }
    await index_1.prisma.projectAssignment.delete({
        where: {
            projectId_employeeId: {
                projectId: projectId,
                employeeId: data.employeeId
            }
        }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'USER_UNASSIGNED',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId: projectId,
            details: `Unassigned ${assignment.employee.name} from project`
        }
    });
    res.json({
        success: true,
        message: 'Employee unassigned successfully',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}
async function handleMilestoneAction(req, res, projectId, milestoneData) {
    if (milestoneData.action === 'create') {
        const milestone = await index_1.prisma.milestone.create({
            data: {
                projectId: projectId,
                title: milestoneData.title,
                description: milestoneData.description,
                dueDate: new Date(milestoneData.dueDate)
            }
        });
        await index_1.prisma.activityLog.create({
            data: {
                userId: req.user.id,
                action: 'MILESTONE_CREATED',
                entityType: 'MILESTONE',
                entityId: milestone.id,
                projectId: projectId,
                details: `Created milestone: ${milestone.title}`
            }
        });
        res.json({
            success: true,
            data: {
                ...milestone,
                dueDate: milestone.dueDate.toISOString(),
                createdAt: milestone.createdAt.toISOString(),
                updatedAt: milestone.updatedAt.toISOString()
            },
            message: 'Milestone created successfully'
        });
    }
    else if (milestoneData.action === 'complete') {
        const milestone = await index_1.prisma.milestone.update({
            where: { id: milestoneData.milestoneId },
            data: {
                completed: true,
                completedAt: new Date()
            }
        });
        await index_1.prisma.activityLog.create({
            data: {
                userId: req.user.id,
                action: 'MILESTONE_COMPLETED',
                entityType: 'MILESTONE',
                entityId: milestone.id,
                projectId: projectId,
                details: `Completed milestone: ${milestone.title}`
            }
        });
        res.json({
            success: true,
            message: 'Milestone completed successfully'
        });
    }
}
async function handleAddComment(req, res, projectId, commentData) {
    const comment = await index_1.prisma.comment.create({
        data: {
            content: commentData.content,
            userId: req.user.id,
            projectId: projectId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            }
        }
    });
    res.json({
        success: true,
        data: {
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        },
        message: 'Comment added successfully'
    });
}
async function handleCompleteProject(req, res, projectId) {
    const project = await index_1.prisma.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'PROJECT_COMPLETED',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId: projectId,
            details: `Completed project: ${project.title}`
        }
    });
    res.json({
        success: true,
        message: 'Project completed successfully'
    });
}
async function handleActivateProject(req, res, projectId) {
    const project = await index_1.prisma.project.update({
        where: { id: projectId },
        data: { status: 'ACTIVE' }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'PROJECT_ACTIVATED',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId: projectId,
            details: `Activated project: ${project.title}`
        }
    });
    res.json({
        success: true,
        message: 'Project activated successfully'
    });
}
async function handleDeleteProject(req, res, projectId) {
    const project = await index_1.prisma.project.findUnique({
        where: { id: projectId }
    });
    if (!project) {
        throw new errorHandler_1.NotFoundError('Project not found');
    }
    const canDelete = req.user.role === 'admin' ||
        req.user.role === 'program_manager' ||
        project.managerId === req.user.id;
    if (!canDelete) {
        throw new errorHandler_1.ValidationError('Insufficient permissions to delete this project');
    }
    await index_1.prisma.project.update({
        where: { id: projectId },
        data: { status: 'CANCELLED' }
    });
    await index_1.prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action: 'PROJECT_DELETED',
            entityType: 'PROJECT',
            entityId: projectId,
            projectId: projectId,
            details: `Deleted project: ${project.title}`
        }
    });
    res.json({
        success: true,
        message: 'Project deleted successfully'
    });
}
async function calculateProjectAnalytics(where) {
    const [statusCounts, priorityCounts, totalProjects] = await Promise.all([
        index_1.prisma.project.groupBy({
            by: ['status'],
            where,
            _count: { status: true }
        }),
        index_1.prisma.project.groupBy({
            by: ['priority'],
            where,
            _count: { priority: true }
        }),
        index_1.prisma.project.count({ where })
    ]);
    return {
        projectsByStatus: statusCounts.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item._count.status;
            return acc;
        }, {}),
        projectsByPriority: priorityCounts.reduce((acc, item) => {
            acc[item.priority.toLowerCase()] = item._count.priority;
            return acc;
        }, {}),
        totalProjects
    };
}
exports.default = router;
//# sourceMappingURL=projects.js.map