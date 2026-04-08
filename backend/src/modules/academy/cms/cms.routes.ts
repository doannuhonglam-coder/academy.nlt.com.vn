import { Router } from 'express';
import { requireAuth, requireRole } from '../../../middleware/auth';
import { handleCreateCourse, handleUpdateCourse, handlePublishCourse } from './cms.controller';

export const cmsRouter = Router();

// All CMS routes require admin or owner
cmsRouter.use(requireAuth, requireRole('admin', 'owner'));

// POST   /api/v1/academy/cms/courses
cmsRouter.post('/courses', handleCreateCourse);

// PATCH  /api/v1/academy/cms/courses/:slug
cmsRouter.patch('/courses/:slug', handleUpdateCourse);

// PATCH  /api/v1/academy/cms/courses/:slug/publish
cmsRouter.patch('/courses/:slug/publish', handlePublishCourse);
