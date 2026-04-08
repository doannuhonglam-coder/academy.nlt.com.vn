import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth';

export const progressRouter = Router();

// GET /api/v1/academy/me/dashboard — Sprint 2
progressRouter.get('/dashboard', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 2', details: {}, request_id: '' });
});

// GET /api/v1/academy/me/gamification — Sprint 5
progressRouter.get('/gamification', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 5', details: {}, request_id: '' });
});
