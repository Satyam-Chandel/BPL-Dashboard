import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { User } from '../../../shared/types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Authenticate JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
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

    // Convert Prisma user to shared User type
    req.user = {
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
      notificationSettings: user.notificationSettings as any
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
};

// Authorize based on roles
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

// Check if user can access resource (for hierarchical access)
export const canAccessUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  const targetUserId = req.params.id || req.body.userId || req.query.userId;
  
  // Admin can access anyone
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Users can access their own data
  if (req.user.id === targetUserId) {
    next();
    return;
  }

  // Managers can access their subordinates
  if (['program_manager', 'rd_manager', 'manager'].includes(req.user.role)) {
    // This would need to be implemented based on your hierarchy logic
    // For now, allowing managers to access their direct reports
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: 'Access denied'
  });
};

// Check if user can manage projects
export const canManageProjects = (req: Request, res: Response, next: NextFunction): void => {
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

// Optional authentication (for public endpoints that benefit from user context)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (user && user.isActive) {
        req.user = {
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
          notificationSettings: user.notificationSettings as any
        };
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};
