import { Request, Response, NextFunction } from 'express';
import { QueryParams, PaginationParams, FilterParams } from '../../../shared/types';

// Extend Express Request type to include parsed query parameters
declare global {
  namespace Express {
    interface Request {
      pagination: PaginationParams;
      filters: FilterParams;
      include: string[];
      flags: {
        analytics: boolean;
        workload: boolean;
        count: boolean;
      };
      parsedQuery: QueryParams;
    }
  }
}

export const parseQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { query } = req;

  // Parse pagination parameters
  req.pagination = {
    page: query.page ? Math.max(1, parseInt(query.page as string)) : 1,
    limit: query.limit ? Math.min(100, Math.max(1, parseInt(query.limit as string))) : 10
  };

  // Parse filter parameters
  req.filters = {};
  const filterFields = ['status', 'priority', 'role', 'department', 'search'];
  filterFields.forEach(field => {
    if (query[field] && typeof query[field] === 'string') {
      req.filters[field as keyof FilterParams] = query[field] as string;
    }
  });

  // Parse include relationships (comma-separated)
  req.include = [];
  if (query.include && typeof query.include === 'string') {
    req.include = query.include.split(',').map(item => item.trim()).filter(Boolean);
  }

  // Parse boolean flags
  req.flags = {
    analytics: query.analytics === 'true',
    workload: query.workload === 'true',
    count: query.count === 'true'
  };

  // Store all parsed query parameters
  req.parsedQuery = {
    ...req.pagination,
    ...req.filters,
    id: query.id as string,
    include: req.include.join(','),
    analytics: req.flags.analytics,
    workload: req.flags.workload,
    count: req.flags.count,
    manager: query.manager as string,
    assignee: query.assignee as string,
    creator: query.creator as string,
    unread: query.unread === 'true',
    type: query.type as string
  };

  next();
};

// Validation middleware for pagination
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit } = req.pagination;

  if (page && page < 1) {
    res.status(400).json({
      success: false,
      error: 'Page number must be greater than 0'
    });
    return;
  }

  if (limit && (limit < 1 || limit > 100)) {
    res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
    return;
  }

  next();
};

// Helper function to build Prisma where clause from filters
export const buildWhereClause = (filters: FilterParams, additionalConditions: any = {}): any => {
  const where: any = { ...additionalConditions };

  // Handle search across multiple fields
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  // Handle exact matches
  if (filters.status) {
    where.status = filters.status.toUpperCase();
  }

  if (filters.priority) {
    where.priority = filters.priority.toUpperCase();
  }

  if (filters.role) {
    where.role = filters.role.toUpperCase();
  }

  if (filters.department) {
    where.department = { contains: filters.department, mode: 'insensitive' };
  }

  return where;
};

// Helper function to build Prisma include clause
export const buildIncludeClause = (includeArray: string[]): any => {
  const include: any = {};

  includeArray.forEach(relation => {
    switch (relation.toLowerCase()) {
      case 'manager':
        include.manager = {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            designation: true
          }
        };
        break;
      case 'assignments':
        include.assignments = {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        };
        break;
      case 'milestones':
        include.milestones = true;
        break;
      case 'comments':
        include.comments = {
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
        };
        break;
      case 'assignee':
        include.assignee = {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        };
        break;
      case 'creator':
        include.creator = {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        };
        break;
      case 'subordinates':
        include.subordinates = {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        };
        break;
      case 'managedprojects':
        include.managedProjects = {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        };
        break;
    }
  });

  return include;
};

// Helper function to calculate pagination metadata
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};
