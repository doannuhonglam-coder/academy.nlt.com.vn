import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth';

export const lessonsRouter = Router();

// GET /api/v1/academy/lessons/:lessonId — Sprint 4
lessonsRouter.get('/:lessonId', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 4', details: {}, request_id: '' });
});

// POST /api/v1/academy/lessons/:lessonId/complete — Sprint 4
lessonsRouter.post('/:lessonId/complete', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 4', details: {}, request_id: '' });
});

// GET /api/v1/academy/lessons/:lessonId/quiz — Sprint 4
lessonsRouter.get('/:lessonId/quiz', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 4', details: {}, request_id: '' });
});

// POST /api/v1/academy/lessons/:lessonId/quiz/submit — Sprint 4
lessonsRouter.post('/:lessonId/quiz/submit', requireAuth, (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Sprint 4', details: {}, request_id: '' });
});
