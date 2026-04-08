import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth';

export const certRouter = Router();

// GET /api/v1/academy/me/certs — Sprint 5
certRouter.get('/certs', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 5', details: {}, request_id: '' });
});
