import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, canManageProjects } from '../middleware/auth';
import { parseQuery, buildWhereClause, buildIncludeClause, getPaginationMeta } from '../middleware/queryParser';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { prisma } from '../index';
import { Project, CreateProjectRequest, UpdateProjectRequest, ActionRequest, AssignEmployeeRequest } from '../../../shared/types';

const router = express.Router();

router.use(authenticateToken);
router.use(parseQuery);

// GET /projects - List projects with filtering, pagination, and includes
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { pagination, filters, include, flags, parsedQuery } = req;
  
  // Build where clause
  let where = buildWhereClause(filters);

  // Add role-based filtering
  if (req.user!.role === 'manager') {
    // Managers can only see their own projects and projects they're assigned to
    where = {
      ...where,
      OR: [
        { managerId: req.user!.id },
        { assignments: { some: { employeeId: req.user!.id } } }
      ]
    };
  } else if (req.user!.role === 'employee') {
    // Employees can only see projects they're assigned to
    where = {
      ...where,
      assignments: { some: { employeeId: req.user!.id } }
    };
  }

  // Filter by manager if specified
  if (parsedQuery.manager) {
    where.managerId = parsedQuery.manager;
  }

  // Get total count for pagination
  const total = await prisma.project.count({ where });

  // Get projects with pagination
  const projects = await prisma.project.findMany({
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
        take: 5 // Limit recent comments
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

  // Convert Prisma projects to shared Project type
  const convertedProjects = projects.map(project => ({
    ...project,
    status: project.status.toLowerCase() as any,
    priority: project.priority.toLowerCase() as any,
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

  // Add analytics if requested
  if (flags.analytics) {
    const analytics = await calculateProjectAnalytics(where);
    res.json({
      success: true,
      data: convertedProjects,
      analytics,
      meta: {
        ...getPaginationMeta(total, pagination.page || 1, pagination.limit || 10),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  res.json({
    success: true,
    data: convertedProjects,
    meta: {
      ...getPaginationMeta(total, pagination.page || 1, pagination.limit || 10),
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /projects/:id - Get specific project
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { include, flags } = req;

  const project = await prisma.project.findUnique({
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
    throw new NotFoundError('Project not found');
  }

  // Check access permissions
  const hasAccess = req.user!.role === 'admin' || 
                   req.user!.role === 'program_manager' ||
                   req.user!.role === 'rd_manager' ||
                   project.managerId === req.user!.id ||
                   project.assignments.some(a => a.employeeId === req.user!.id);

  if (!hasAccess) {
    throw new NotFoundError('Project not found'); // Don't reveal existence
  }

  // Convert to shared Project type
  const convertedProject = {
    ...project,
    status: project.status.toLowerCase() as any,
    priority: project.priority.toLowerCase() as any,
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

// POST /projects - Handle project actions
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { action, id, data }: ActionRequest = req.body;

  switch (action) {
    case 'create':
      await handleCreateProject(req, res, data);
      break;
    case 'update':
      await handleUpdateProject(req, res, id!, data);
      break;
    case 'delete':
      await handleDeleteProject(req, res, id!);
      break;
    case 'assign':
      await handleAssignEmployee(req, res, id!, data);
      break;
    case 'unassign':
      await handleUnassignEmployee(req, res, id!, data);
      break;
    case 'milestone':
      await handleMilestoneAction(req, res, id!, data);
      break;
    case 'comment':
      await handleAddComment(req, res, id!, data);
      break;
    case 'complete':
      await handleCompleteProject(req, res, id!);
      break;
    case 'activate':
      await handleActivateProject(req, res, id!);
      break;
    default:
      throw new ValidationError('Invalid action specified');
  }
}));

// Helper functions for project actions
async function handleCreateProject(req: Request, res: Response, projectData: CreateProjectRequest): Promise<void> {
  // Validate user can create projects
  if (!['admin', 'program_manager', 'rd_manager', 'manager'].includes(req.user!.role)) {
    throw new ValidationError('Insufficient permissions to create projects');
  }

  const project = await prisma.project.create({
    data: {
      title: projectData.title,
      description: projectData.description,
      managerId: req.user!.id, // Creator becomes manager
      priority: (projectData.priority?.toUpperCase() as any) || 'MEDIUM',
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

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleUpdateProject(req: Request, res: Response, projectId: string, projectData: UpdateProjectRequest): Promise<void> {
  const existingProject = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!existingProject) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canUpdate = req.user!.role === 'admin' || 
                   req.user!.role === 'program_manager' ||
                   req.user!.role === 'rd_manager' ||
                   existingProject.managerId === req.user!.id;

  if (!canUpdate) {
    throw new ValidationError('Insufficient permissions to update this project');
  }

  // Create version snapshot before update
  await prisma.projectVersion.create({
    data: {
      projectId: projectId,
      version: existingProject.version,
      snapshot: existingProject as any,
      changedBy: req.user!.id,
      changeType: 'UPDATE'
    }
  });

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(projectData.title && { title: projectData.title }),
      ...(projectData.description !== undefined && { description: projectData.description }),
      ...(projectData.status && { status: projectData.status.toUpperCase() as any }),
      ...(projectData.priority && { priority: projectData.priority.toUpperCase() as any }),
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

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleAssignEmployee(req: Request, res: Response, projectId: string, assignmentData: AssignEmployeeRequest): Promise<void> {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if employee exists
  const employee = await prisma.user.findUnique({
    where: { id: assignmentData.employeeId }
  });

  if (!employee) {
    throw new NotFoundError('Employee not found');
  }

  // Check if already assigned
  const existingAssignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_employeeId: {
        projectId: projectId,
        employeeId: assignmentData.employeeId
      }
    }
  });

  if (existingAssignment) {
    throw new ValidationError('Employee is already assigned to this project');
  }

  // Check workload capacity
  const currentAssignments = await prisma.projectAssignment.findMany({
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
    throw new ValidationError(`Assignment would exceed employee's workload capacity (${employee.workloadCap}%)`);
  }

  // Create assignment
  const assignment = await prisma.projectAssignment.create({
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

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'USER_ASSIGNED',
      entityType: 'PROJECT',
      entityId: projectId,
      projectId: projectId,
      details: `Assigned ${employee.name} to project with ${assignmentData.involvementPercentage}% involvement`
    }
  });

  // Create notification for assigned employee
  await prisma.notification.create({
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

async function handleUnassignEmployee(req: Request, res: Response, projectId: string, data: { employeeId: string }): Promise<void> {
  const assignment = await prisma.projectAssignment.findUnique({
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
    throw new NotFoundError('Assignment not found');
  }

  await prisma.projectAssignment.delete({
    where: {
      projectId_employeeId: {
        projectId: projectId,
        employeeId: data.employeeId
      }
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleMilestoneAction(req: Request, res: Response, projectId: string, milestoneData: any): Promise<void> {
  if (milestoneData.action === 'create') {
    const milestone = await prisma.milestone.create({
      data: {
        projectId: projectId,
        title: milestoneData.title,
        description: milestoneData.description,
        dueDate: new Date(milestoneData.dueDate)
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
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
  } else if (milestoneData.action === 'complete') {
    const milestone = await prisma.milestone.update({
      where: { id: milestoneData.milestoneId },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
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

async function handleAddComment(req: Request, res: Response, projectId: string, commentData: { content: string }): Promise<void> {
  const comment = await prisma.comment.create({
    data: {
      content: commentData.content,
      userId: req.user!.id,
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

async function handleCompleteProject(req: Request, res: Response, projectId: string): Promise<void> {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: 'COMPLETED' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleActivateProject(req: Request, res: Response, projectId: string): Promise<void> {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: 'ACTIVE' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function handleDeleteProject(req: Request, res: Response, projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canDelete = req.user!.role === 'admin' || 
                   req.user!.role === 'program_manager' ||
                   project.managerId === req.user!.id;

  if (!canDelete) {
    throw new ValidationError('Insufficient permissions to delete this project');
  }

  // Soft delete - change status to cancelled
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'CANCELLED' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
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

async function calculateProjectAnalytics(where: any) {
  const [statusCounts, priorityCounts, totalProjects] = await Promise.all([
    prisma.project.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    prisma.project.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true }
    }),
    prisma.project.count({ where })
  ]);

  return {
    projectsByStatus: statusCounts.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.status;
      return acc;
    }, {} as Record<string, number>),
    projectsByPriority: priorityCounts.reduce((acc, item) => {
      acc[item.priority.toLowerCase()] = item._count.priority;
      return acc;
    }, {} as Record<string, number>),
    totalProjects
  };
}

export default router;