import express, { Request, Response } from 'express';
import { mockDb } from '../services/mockDb';

const router = express.Router();

// Simple auth middleware for mock routes
const mockAuth = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  // For demo purposes, just continue without JWT verification
  next();
};

// Apply mock auth to all routes
router.use(mockAuth);

// GET /users - List all users
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await mockDb.getAllUsers();
    
    // Remove sensitive data
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

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /users/:id - Get specific user
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await mockDb.findUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Remove sensitive data
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

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
