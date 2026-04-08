import * as repo from './cms.repository';
import { CreateCourseInput, UpdateCourseInput, CourseRow } from './cms.types';

export async function createCourse(input: CreateCourseInput, createdBy: string): Promise<CourseRow> {
  const existing = await repo.getCourseBySlug(input.slug);
  if (existing) {
    const err = Object.assign(new Error('Slug already exists'), { code: 'SLUG_CONFLICT', status: 409 });
    throw err;
  }
  return repo.createCourse(input, createdBy);
}

export async function updateCourse(slug: string, input: UpdateCourseInput): Promise<CourseRow> {
  const course = await repo.updateCourse(slug, input);
  if (!course) {
    const err = Object.assign(new Error('Course not found'), { code: 'COURSE_NOT_FOUND', status: 404 });
    throw err;
  }
  return course;
}

export async function publishCourse(slug: string): Promise<CourseRow> {
  const course = await repo.publishCourse(slug);
  if (!course) {
    const err = Object.assign(new Error('Course not found'), { code: 'COURSE_NOT_FOUND', status: 404 });
    throw err;
  }
  return course;
}
