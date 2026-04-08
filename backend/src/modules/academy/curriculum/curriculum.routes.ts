import { Router } from 'express';
import { optionalAuth } from '../../../middleware/auth';

export const curriculumRouter = Router();

// GET /api/v1/academy/courses — Sprint 2
curriculumRouter.get('/', optionalAuth, (_req, res) => {
  res.json({ data: [], meta: { total: 0, page: 1, per_page: 20, has_next: false } });
});

// GET /api/v1/academy/courses/:slug — Sprint 2
curriculumRouter.get('/:slug', optionalAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 2', details: {}, request_id: '' });
});
