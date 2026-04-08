export type ContentType = 'community' | 'internal';
export type ProficiencyLevel = 'L1' | 'L2' | 'L3' | 'L4';

export interface CreateCourseInput {
  slug: string;
  title: string;
  description?: string;
  content_type: ContentType;
  proficiency_level: ProficiencyLevel;
  thumbnail_url?: string;
  estimated_minutes?: number;
  is_offline_available?: boolean;
  offline_size_mb?: number;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  estimated_minutes?: number;
  proficiency_level?: ProficiencyLevel;
  is_offline_available?: boolean;
  offline_size_mb?: number;
}

export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  content_type: ContentType;
  proficiency_level: ProficiencyLevel;
  thumbnail_url: string | null;
  estimated_minutes: number;
  total_xp: number;
  lesson_count: number;
  avg_rating: number | null;
  rating_count: number;
  is_offline_available: boolean;
  offline_size_mb: number | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
