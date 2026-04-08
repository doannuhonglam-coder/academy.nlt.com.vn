import { pool } from '../../../db';
import { CreateCourseInput, UpdateCourseInput, CourseRow } from './cms.types';

export async function createCourse(input: CreateCourseInput, createdBy: string): Promise<CourseRow> {
  const { rows } = await pool.query<CourseRow>(
    `INSERT INTO academy_courses
      (slug, title, description, content_type, proficiency_level,
       thumbnail_url, estimated_minutes, is_offline_available, offline_size_mb, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      input.slug,
      input.title,
      input.description ?? '',
      input.content_type,
      input.proficiency_level,
      input.thumbnail_url ?? null,
      input.estimated_minutes ?? 0,
      input.is_offline_available ?? false,
      input.offline_size_mb ?? null,
      createdBy,
    ],
  );
  return rows[0];
}

export async function updateCourse(slug: string, input: UpdateCourseInput): Promise<CourseRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const setField = (col: string, val: unknown) => {
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  };

  if (input.title !== undefined) setField('title', input.title);
  if (input.description !== undefined) setField('description', input.description);
  if (input.thumbnail_url !== undefined) setField('thumbnail_url', input.thumbnail_url);
  if (input.estimated_minutes !== undefined) setField('estimated_minutes', input.estimated_minutes);
  if (input.proficiency_level !== undefined) setField('proficiency_level', input.proficiency_level);
  if (input.is_offline_available !== undefined) setField('is_offline_available', input.is_offline_available);
  if (input.offline_size_mb !== undefined) setField('offline_size_mb', input.offline_size_mb);

  if (fields.length === 0) return getCourseBySlug(slug);

  fields.push(`updated_at = now()`);
  values.push(slug);

  const { rows } = await pool.query<CourseRow>(
    `UPDATE academy_courses SET ${fields.join(', ')} WHERE slug = $${idx} RETURNING *`,
    values,
  );

  return rows[0] ?? null;
}

export async function publishCourse(slug: string): Promise<CourseRow | null> {
  const { rows } = await pool.query<CourseRow>(
    `UPDATE academy_courses
     SET is_published = true, published_at = now(), updated_at = now()
     WHERE slug = $1
     RETURNING *`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function getCourseBySlug(slug: string): Promise<CourseRow | null> {
  const { rows } = await pool.query<CourseRow>(
    'SELECT * FROM academy_courses WHERE slug = $1 LIMIT 1',
    [slug],
  );
  return rows[0] ?? null;
}
