import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createCourseSchema, updateCourseSchema } from './cms.schema';
import * as service from './cms.service';

function apiError(code: string, message: string, status: number, res: Response): void {
  res.status(status).json({ code, message, details: {}, request_id: '' });
}

export async function handleCreateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createCourseSchema.parse(req.body);
    const course = await service.createCourse(input, req.user!.id);
    res.status(201).json(course);
  } catch (err) {
    if (err instanceof ZodError) {
      apiError('VALIDATION_ERROR', err.errors[0]?.message ?? 'Validation error', 400, res);
      return;
    }
    const e = err as { code?: string; status?: number; message: string };
    if (e.code) {
      apiError(e.code, e.message, e.status ?? 400, res);
      return;
    }
    next(err);
  }
}

export async function handleUpdateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateCourseSchema.parse(req.body);
    const course = await service.updateCourse(req.params.slug, input);
    res.json(course);
  } catch (err) {
    if (err instanceof ZodError) {
      apiError('VALIDATION_ERROR', err.errors[0]?.message ?? 'Validation error', 400, res);
      return;
    }
    const e = err as { code?: string; status?: number; message: string };
    if (e.code) {
      apiError(e.code, e.message, e.status ?? 400, res);
      return;
    }
    next(err);
  }
}

export async function handlePublishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await service.publishCourse(req.params.slug);
    res.json(course);
  } catch (err) {
    const e = err as { code?: string; status?: number; message: string };
    if (e.code) {
      apiError(e.code, e.message, e.status ?? 400, res);
      return;
    }
    next(err);
  }
}
