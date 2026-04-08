import { Router } from 'express';
import { cmsRouter } from './cms/cms.routes';
import { curriculumRouter } from './curriculum/curriculum.routes';
import { progressRouter } from './progress/progress.routes';
import { lessonsRouter } from './lessons/lessons.routes';
import { certRouter } from './cert/cert.routes';
import { ndataRouter } from './ndata/ndata.routes';
import { leaderRouter } from './leader/leader.routes';

export const academyRouter = Router();

// Public / optional-auth
academyRouter.use('/courses', curriculumRouter);

// Authenticated learner routes
academyRouter.use('/me', progressRouter);
academyRouter.use('/me', certRouter);
academyRouter.use('/lessons', lessonsRouter);
academyRouter.use('/events', ndataRouter);

// Leader+
academyRouter.use('/leader', leaderRouter);

// N-Data analytics (admin/owner only — enforced inside router)
academyRouter.use('/ndata', ndataRouter);

// CMS (admin/owner only — enforced inside router)
academyRouter.use('/cms', cmsRouter);
