// Academy.nlt TypeScript interfaces — mirrors API contract

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ContentType = 'community' | 'internal';
export type ProficiencyLevel = 'L1' | 'L2' | 'L3' | 'L4';
export type LessonType = 'video' | 'reading' | 'quiz' | 'project';
export type EnrollmentStatus = 'in_progress' | 'completed' | 'abandoned';
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type AcademyRole = 'owner' | 'admin' | 'leader' | 'co-leader' | 'member' | 'community_learner';
export type EventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'course_enrolled'
  | 'video_progress'
  | 'offline_downloaded'
  | 'search_performed';

// ─── Person ───────────────────────────────────────────────────────────────────

export interface PersonBrief {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export type NhileTier = 'volunteer' | 'work-and-learn' | 'nhile-star' | 'nhile-certificate';

export interface CourseBrief {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content_type: ContentType;
  proficiency_level: ProficiencyLevel;
  thumbnail_url: string | null;
  lesson_count: number;
  estimated_minutes: number;
  total_xp?: number;
  avg_rating: number | null;
  rating_count?: number;
  is_offline_available: boolean;
  offline_size_mb: number | null;
  is_published: boolean;
  locked?: boolean;
  required_tier?: NhileTier;       // tier-lock: need this tier
  required_credits?: number;       // credit-lock: need this many Nhile Credits
  unlock_date?: string;            // ISO date — if locked until a date
}

export interface ProgramBrief {
  id: string;
  slug: string;
  title: string;
  proficiency_level: ProficiencyLevel;
  required_course_count: number;
  min_quiz_score: number;
}

export interface LessonBrief {
  id: string;
  title: string;
  lesson_type: LessonType;
  lesson_order: number;
  module_order: number;
  estimated_minutes: number;
  xp_reward: number;
  is_previewable: boolean;
  is_published: boolean;
}

export interface LessonWithStatus extends LessonBrief {
  status: LessonStatus;
  unlock_after_lesson_title: string | null;
  completed_at: string | null;
}

export interface ModuleWithLessons {
  module_title: string;
  module_order: number;
  lessons: LessonBrief[];
}

export interface ModuleWithLessonStatus {
  module_title: string;
  module_order: number;
  completion_pct: number;
  lessons: LessonWithStatus[];
}

export interface CourseDetail extends CourseBrief {
  programs: ProgramBrief[];
  modules: ModuleWithLessons[];
}

export interface EnrollmentStatus_t {
  id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_pct: number;
  lessons_completed: number;
  total_lessons: number;
  xp_earned: number;
  enrolled_at: string;
  last_active_at: string;
  completed_at: string | null;
}

export interface CourseDetailWithProgress {
  course: CourseDetail;
  enrollment: EnrollmentStatus_t | null;
  modules: ModuleWithLessonStatus[];
}

// ─── Lesson Content ───────────────────────────────────────────────────────────

export interface LessonContent extends LessonBrief {
  video_stream_url: string | null;
  video_duration_s: number | null;
  content_markdown: string | null;
  key_points: string[];
  next_lesson: LessonBrief | null;
  prev_lesson: LessonBrief | null;
  course_brief: CourseBrief;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  option_text: string;
  position: number;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  position: number;
  question_text: string;
  xp_reward: number;
  options: QuizOption[];
}

export interface QuizOptionWithAnswer extends QuizOption {
  is_correct: boolean;
  explanation: string | null;
}

export interface QuizResult {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  xp_earned: number;
  options_with_answer: QuizOptionWithAnswer[];
}

// ─── Lesson Complete ──────────────────────────────────────────────────────────

export interface BadgeAward {
  id: string;
  code: string;
  title: string;
  description?: string;
  icon_url: string | null;
  xp_bonus: number;
  awarded_at: string;
}

export interface GamificationDelta {
  level_up: boolean;
  new_level: number | null;
  badges_earned: BadgeAward[];
  streak_updated: number;
}

export interface LessonCompleteResult {
  xp_earned: number;
  total_xp_now: number;
  enrollment_status: EnrollmentStatus_t;
  gamification_delta: GamificationDelta;
  course_completed: boolean;
  next_lesson: LessonBrief | null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface ActiveLesson {
  course_id: string;
  course_slug: string;
  course_title: string;
  course_thumbnail_url: string | null;
  lesson_id: string;
  lesson_title: string;
  lesson_type: LessonType;
  progress_pct: number;
  last_active_at: string;
}

export interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_at_risk: boolean;
}

export interface DailyChallenge {
  xp_reward: number;
  is_completed_today: boolean;
  challenge_description: string;
}

export interface LearnerStats {
  total_xp: number;
  current_level: number;
  lessons_completed: number;
  hours_learned: number;
  certs_earned: number;
}

export interface LearnerDashboard {
  person: PersonBrief;
  stats: LearnerStats;
  active_lesson: ActiveLesson | null;
  streak: StreakState;
  daily_challenge: DailyChallenge | null;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface XPHistoryEntry {
  date: string;
  xp_earned: number;
  events_count: number;
}

export interface GamificationState {
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  xp_for_next_level_total: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  badges: BadgeAward[];
  xp_history: XPHistoryEntry[];
}

// ─── Certs ────────────────────────────────────────────────────────────────────

export interface NltCert {
  id: string;
  verify_code: string;
  program_id: string;
  person_name_snapshot: string;
  program_title_snapshot: string;
  program_level_snapshot: string;
  issued_at: string;
  issued_by: string | null;
  is_superseded: boolean;
  verify_url: string | null;
}

export interface CertCourseProgress {
  course: CourseBrief;
  enrollment_status_in_program: 'not_started' | 'in_progress' | 'completed';
}

export interface CertProgress {
  program: ProgramBrief;
  completion_pct: number;
  courses: CertCourseProgress[];
}

export interface MyCertsResponse {
  earned_certs: NltCert[];
  cert_progress: CertProgress[];
}

// ─── Learning Events ──────────────────────────────────────────────────────────

export interface LearningEvent {
  event_type: EventType;
  entity_type: 'lesson' | 'course' | 'quiz_question' | 'account';
  entity_id: string;
  client_timestamp: string;
  is_offline_sync?: boolean;
  payload?: Record<string, unknown>;
}

// ─── Leader / N-Data ─────────────────────────────────────────────────────────

export interface TopCourse {
  course_title: string;
  enrollment_count: number;
  avg_completion_pct: number;
}

export interface TeamProgressSummary {
  team_id: string;
  team_name: string;
  member_count: number;
  avg_completion_pct: number;
  active_learners: number;
  courses_completed: number;
  top_courses: TopCourse[];
}

export interface NDataOverview {
  total_learners: number;
  active_learners_7d: number;
  total_events: number;
  events_7d: number;
  top_courses: {
    course_slug: string;
    course_title: string;
    enrollment_count: number;
    completion_count: number;
    avg_quiz_score: number | null;
  }[];
  teams_overview: TeamProgressSummary[];
  data_as_of: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export interface OfflineQueueItem {
  id: string;
  event: LearningEvent;
  queued_at: string;
  retry_count: number;
}
