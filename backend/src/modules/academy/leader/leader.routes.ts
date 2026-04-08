import { Router } from 'express';
import { requireAuth, requireRole } from '../../../middleware/auth';

export const leaderRouter = Router();

// GET /api/v1/academy/leader/team-progress — Sprint 6 (leader+)
leaderRouter.get(
  '/team-progress',
  requireAuth,
  requireRole('leader', 'co-leader', 'admin', 'owner'),
  (_req, res) => {
    res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 6', details: {}, request_id: '' });
  },
);
