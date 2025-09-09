import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();
router.use(authenticateToken);

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Export endpoint - Coming soon',
    meta: { timestamp: new Date().toISOString() }
  });
}));

export default router;

