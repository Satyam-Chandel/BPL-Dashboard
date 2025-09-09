import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { authenticateToken, authorize, canAccessUser } from '../middleware/auth';
import { parseQuery, buildWhereClause, buildIncludeClause, getPaginationMeta } from '../middleware/queryParser';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { prisma } from '../index';
import { User, CreateUserRequest, UpdateUserRequest, ActionRequest } from '../../../shared/types';

const router = express.Router();

// Apply middleware to all routes
router.use(authenticateToken);
router.use(parseQuery);

// GET /users - List users with filtering, pagination, and includes
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { pagination, filters, include, flags } = req;
  
  // Build where clause
  const where = buildWhereClause(filters, {
    isActive: true // Only show active users by default
  });

  // Build include clause
  const includeClause = buildIncludeClause(include);

  // Get total count for pagination
  const total = await prisma.user.count({ where });

  // Get users with pagination
  const users = await prisma.user.findMany({
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
      // Include relations if requested
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

  // Convert Prisma users to shared User type
  const convertedUsers = users.map(user => ({
    ...user,
    role: user.role.toLowerCase() as any,
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

  // Calculate workload if requested
  if (flags.workload) {
    for (const user of convertedUsers) {
      const assignments = await prisma.projectAssignment.findMany({
        where: { employeeId: user.id },
        include: {
          project: {
            select: { status: true }
          }
        }
      });

      const initiatives = await prisma.initiative.findMany({
        where: { assignedTo: user.id, status: { not: 'COMPLETED' } }
      });

      const projectWorkload = assignments
        .filter(a => a.project.status === 'ACTIVE')
        .reduce((sum, a) => sum + a.involvementPercentage, 0);

      const overBeyondWorkload = initiatives
        .reduce((sum, i) => sum + i.workloadPercentage, 0);

      (user as any).workloadData = {
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
      ...getPaginationMeta(total, pagination.page || 1, pagination.limit || 10),
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /users/:id - Get specific user
router.get('/:id', canAccessUser, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { include, flags } = req;

  const user = await prisma.user.findUnique({
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
      // Include relations if requested
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
    throw new NotFoundError('User not found');
  }

  // Convert to shared User type
  const convertedUser = {
    ...user,
    role: user.role.toLowerCase() as any,
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

  // Calculate workload if requested
  if (flags.workload) {
    const assignments = await prisma.projectAssignment.findMany({
      where: { employeeId: user.id },
      include: {
        project: {
          select: { status: true }
        }
      }
    });

    const initiatives = await prisma.initiative.findMany({
      where: { assignedTo: user.id, status: { not: 'COMPLETED' } }
    });

    const projectWorkload = assignments
      .filter(a => a.project.status === 'ACTIVE')
      .reduce((sum, a) => sum + a.involvementPercentage, 0);

    const overBeyondWorkload = initiatives
      .reduce((sum, i) => sum + i.workloadPercentage, 0);

    (convertedUser as any).workloadData = {
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

// POST /users - Handle user actions (create, update, delete, etc.)
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { action, id, data }: ActionRequest = req.body;

  switch (action) {
    case 'create':
      await handleCreateUser(req, res, data);
      break;
    case 'update':
      await handleUpdateUser(req, res, id!, data);
      break;
    case 'delete':
      await handleDeleteUser(req, res, id!);
      break;
    case 'activate':
      await handleActivateUser(req, res, id!);
      break;
    case 'deactivate':
      await handleDeactivateUser(req, res, id!);
      break;
    case 'updateSettings':
      await handleUpdateSettings(req, res, id!, data);
      break;
    default:
      throw new ValidationError('Invalid action specified');
  }
}));

// Helper functions for user actions
async function handleCreateUser(req: Request, res: Response, userData: any): Promise<void> {
  // Validate required fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // Create user
  const user = await prisma.user.create({
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

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleUpdateUser(req: Request, res: Response, userId: string, userData: any): Promise<void> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new NotFoundError('User not found');
  }

  // Update user
  const user = await prisma.user.update({
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

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleDeleteUser(req: Request, res: Response, userId: string): Promise<void> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new NotFoundError('User not found');
  }

  // Soft delete (deactivate) instead of hard delete
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleActivateUser(req: Request, res: Response, userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleDeactivateUser(req: Request, res: Response, userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleUpdateSettings(req: Request, res: Response, userId: string, settings: any): Promise<void> {
  const user = await prisma.user.update({
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

export default router;