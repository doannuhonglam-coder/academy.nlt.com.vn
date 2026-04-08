import { Router } from 'express';
import { requireAuth, requireRole } from '../../../middleware/auth';

export const ndataRouter = Router();

// POST /api/v1/academy/events — Sprint 2
ndataRouter.post('/', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 2', details: {}, request_id: '' });
});

// POST /api/v1/academy/events/batch — Sprint 2
ndataRouter.post('/batch', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 2', details: {}, request_id: '' });
});

// GET /api/v1/academy/ndata/overview — Sprint 6 (admin/owner)
ndataRouter.get('/overview', requireAuth, requireRole('admin', 'owner'), (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 6', details: {}, request_id: '' });
});

// GET /api/v1/academy/ndata/events/export — Sprint 6 (admin/owner)
ndataRouter.get('/events/export', requireAuth, requireRole('admin', 'owner'), (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 6', details: {}, request_id: '' });
});
