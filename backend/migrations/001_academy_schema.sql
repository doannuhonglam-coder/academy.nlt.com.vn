-- ═══════════════════════════════════════════════════════════════════════════
-- Academy.nlt — Migration 001: Full Schema + RLS
-- NL-CLAUDE-ACADEMY-001 v1.0
-- Append-only rule: academy_learning_events — NO UPDATE, NO DELETE ever
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── ENUM TYPES ─────────────────────────────────────────────────────────────

CREATE TYPE academy_content_type AS ENUM ('community', 'internal');
CREATE TYPE academy_proficiency_level AS ENUM ('L1', 'L2', 'L3', 'L4');
CREATE TYPE academy_lesson_type AS ENUM ('video', 'reading', 'quiz', 'project');
CREATE TYPE academy_enrollment_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE academy_lesson_status AS ENUM ('locked', 'available', 'in_progress', 'completed');
CREATE TYPE academy_event_type AS ENUM (
  'lesson_started',
  'lesson_completed',
  'quiz_submitted',
  'course_enrolled',
  'video_progress',
  'offline_downloaded',
  'search_performed'
);

-- ─── PROGRAMS ────────────────────────────────────────────────────────────────

CREATE TABLE academy_programs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  proficiency_level     academy_proficiency_level NOT NULL,
  content_type          academy_content_type NOT NULL DEFAULT 'community',
  required_course_count INTEGER NOT NULL DEFAULT 1,
  min_quiz_score        NUMERIC(5,2) NOT NULL DEFAULT 70.0,
  is_published          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── COURSES ─────────────────────────────────────────────────────────────────

CREATE TABLE academy_courses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  content_type          academy_content_type NOT NULL,
  proficiency_level     academy_proficiency_level NOT NULL,
  thumbnail_url         TEXT,
  estimated_minutes     INTEGER NOT NULL DEFAULT 0,
  total_xp              INTEGER NOT NULL DEFAULT 0,
  lesson_count          INTEGER NOT NULL DEFAULT 0,
  avg_rating            NUMERIC(3,1),
  rating_count          INTEGER NOT NULL DEFAULT 0,
  is_offline_available  BOOLEAN NOT NULL DEFAULT false,
  offline_size_mb       NUMERIC(10,2),
  is_published          BOOLEAN NOT NULL DEFAULT false,
  published_at          TIMESTAMPTZ,
  created_by            UUID REFERENCES persons(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academy_program_courses (
  program_id    UUID NOT NULL REFERENCES academy_programs(id),
  course_id     UUID NOT NULL REFERENCES academy_courses(id),
  is_required   BOOLEAN NOT NULL DEFAULT true,
  course_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (program_id, course_id)
);

-- ─── MODULES ─────────────────────────────────────────────────────────────────

CREATE TABLE academy_modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  module_order  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── LESSONS ─────────────────────────────────────────────────────────────────

CREATE TABLE academy_lessons (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id               UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  module_id               UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  lesson_type             academy_lesson_type NOT NULL,
  lesson_order            INTEGER NOT NULL DEFAULT 0,
  module_order            INTEGER NOT NULL DEFAULT 0,
  estimated_minutes       INTEGER NOT NULL DEFAULT 5,
  xp_reward               INTEGER NOT NULL DEFAULT 20,
  is_previewable          BOOLEAN NOT NULL DEFAULT false,
  is_published            BOOLEAN NOT NULL DEFAULT false,
  unlock_after_lesson_id  UUID REFERENCES academy_lessons(id),
  -- video fields
  cf_stream_uid           TEXT,
  video_duration_s        INTEGER,
  -- reading fields
  content_markdown        TEXT,
  key_points              JSONB NOT NULL DEFAULT '[]',
  -- media metadata
  metadata                JSONB NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── QUIZ ────────────────────────────────────────────────────────────────────

CREATE TABLE academy_quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  xp_reward     INTEGER NOT NULL DEFAULT 15,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academy_quiz_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES academy_quiz_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  is_correct    BOOLEAN NOT NULL DEFAULT false,
  explanation   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ENROLLMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE academy_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id         UUID NOT NULL REFERENCES persons(id),
  course_id         UUID NOT NULL REFERENCES academy_courses(id),
  status            academy_enrollment_status NOT NULL DEFAULT 'in_progress',
  progress_pct      NUMERIC(5,2) NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  total_lessons     INTEGER NOT NULL DEFAULT 0,
  xp_earned         INTEGER NOT NULL DEFAULT 0,
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  UNIQUE (person_id, course_id)
);

-- ─── LEARNING EVENTS — APPEND-ONLY ───────────────────────────────────────────
-- CRITICAL: Never UPDATE or DELETE rows in this table

CREATE TABLE academy_learning_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id         UUID NOT NULL REFERENCES persons(id),
  event_type        academy_event_type NOT NULL,
  entity_type       TEXT NOT NULL,
  entity_id         UUID NOT NULL,
  payload           JSONB NOT NULL DEFAULT '{}',
  is_offline_sync   BOOLEAN NOT NULL DEFAULT false,
  client_timestamp  TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ale_person_type    ON academy_learning_events (person_id, event_type);
CREATE INDEX idx_ale_entity         ON academy_learning_events (entity_id, event_type);
CREATE INDEX idx_ale_created_at     ON academy_learning_events (created_at DESC);
CREATE INDEX idx_ale_person_created ON academy_learning_events (person_id, created_at DESC);

-- ─── GAMIFICATION STATE ───────────────────────────────────────────────────────

CREATE TABLE academy_gamification_state (
  person_id           UUID PRIMARY KEY REFERENCES persons(id),
  total_xp            INTEGER NOT NULL DEFAULT 0,
  current_level       INTEGER NOT NULL DEFAULT 1,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_activity_date  DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── BADGES ──────────────────────────────────────────────────────────────────

CREATE TABLE academy_badge_definitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_url    TEXT,
  xp_bonus    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academy_badge_awards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   UUID NOT NULL REFERENCES persons(id),
  badge_id    UUID NOT NULL REFERENCES academy_badge_definitions(id),
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, badge_id)
);

-- ─── NLT CERTS — IMMUTABLE ───────────────────────────────────────────────────

CREATE TABLE academy_nlt_certs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verify_code              CHAR(8) UNIQUE NOT NULL,
  person_id                UUID NOT NULL REFERENCES persons(id),
  program_id               UUID NOT NULL REFERENCES academy_programs(id),
  person_name_snapshot     TEXT NOT NULL,
  program_title_snapshot   TEXT NOT NULL,
  program_level_snapshot   TEXT NOT NULL,
  issued_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  issued_by                UUID REFERENCES persons(id),
  is_superseded            BOOLEAN NOT NULL DEFAULT false,
  verify_url               TEXT
);

-- ─── MEDIA FILES ─────────────────────────────────────────────────────────────

CREATE TABLE academy_media_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID REFERENCES academy_lessons(id),
  cf_stream_uid   TEXT,
  file_type       TEXT NOT NULL,
  size_mb         NUMERIC(10,2),
  duration_s      INTEGER,
  thumbnail_url   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  uploaded_by     UUID REFERENCES persons(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE academy_programs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quiz_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_learning_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_gamification_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_badge_awards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_nlt_certs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_media_files       ENABLE ROW LEVEL SECURITY;

-- Courses: public thấy community courses đã publish
CREATE POLICY "public can read published community courses"
  ON academy_courses FOR SELECT
  USING (is_published = true AND content_type = 'community');

-- Courses: internal members thấy cả internal courses đã publish
CREATE POLICY "internal members can read published internal courses"
  ON academy_courses FOR SELECT
  USING (
    is_published = true AND content_type = 'internal'
    AND auth.uid() IN (
      SELECT id FROM persons WHERE role IN ('member','co-leader','leader','admin','owner')
    )
  );

-- Courses: admin/owner thấy tất cả kể cả draft
CREATE POLICY "admin owner can read all courses"
  ON academy_courses FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM persons WHERE role IN ('admin','owner'))
  );

-- Modules + Lessons: inherit từ course visibility
CREATE POLICY "modules visible if course visible"
  ON academy_modules FOR SELECT
  USING (
    course_id IN (SELECT id FROM academy_courses WHERE is_published = true)
  );

CREATE POLICY "lessons visible if course visible"
  ON academy_lessons FOR SELECT
  USING (
    course_id IN (SELECT id FROM academy_courses WHERE is_published = true)
    AND is_published = true
  );

-- Enrollments
CREATE POLICY "learner sees own enrollments"
  ON academy_enrollments FOR SELECT
  USING (person_id = auth.uid());

CREATE POLICY "learner inserts own enrollment"
  ON academy_enrollments FOR INSERT
  WITH CHECK (person_id = auth.uid());

CREATE POLICY "backend updates enrollment"
  ON academy_enrollments FOR UPDATE
  USING (person_id = auth.uid());

-- Leader thấy team enrollments
CREATE POLICY "leader sees team enrollments"
  ON academy_enrollments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.id FROM persons p
      JOIN persons learner ON learner.team_id = p.team_id
      WHERE p.id = auth.uid()
        AND p.role IN ('leader','co-leader')
        AND learner.id = academy_enrollments.person_id
    )
  );

-- Admin/Owner thấy tất cả
CREATE POLICY "admin owner sees all enrollments"
  ON academy_enrollments FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM persons WHERE role IN ('admin','owner'))
  );

-- Learning events: học viên SELECT + INSERT của mình (KHÔNG có UPDATE policy)
CREATE POLICY "learner sees own events"
  ON academy_learning_events FOR SELECT
  USING (person_id = auth.uid());

CREATE POLICY "learner inserts own events"
  ON academy_learning_events FOR INSERT
  WITH CHECK (person_id = auth.uid());

CREATE POLICY "admin owner sees all events"
  ON academy_learning_events FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM persons WHERE role IN ('admin','owner'))
  );

-- Gamification
CREATE POLICY "learner sees own gamification"
  ON academy_gamification_state FOR SELECT
  USING (person_id = auth.uid());

-- Certs
CREATE POLICY "learner sees own certs"
  ON academy_nlt_certs FOR SELECT
  USING (person_id = auth.uid());

-- Seed badge definitions
INSERT INTO academy_badge_definitions (code, title, description, xp_bonus) VALUES
  ('first_lesson',   'Bước đầu tiên',       'Hoàn thành bài học đầu tiên',           50),
  ('first_course',   'Khoá đầu tiên',        'Hoàn thành khoá học đầu tiên',         200),
  ('streak_3',       'Streak 3 ngày',         'Học liên tiếp 3 ngày',                 75),
  ('streak_7',       'Streak 7 ngày',         'Học liên tiếp 7 ngày',                150),
  ('streak_30',      'Streak 30 ngày',        'Học liên tiếp 30 ngày',               500),
  ('first_cert',     'Chứng chỉ đầu tiên',   'Nhận chứng chỉ NLT đầu tiên',         300),
  ('quiz_perfect',   'Điểm tuyệt đối',        'Đạt 100% quiz trong 1 khoá',          100),
  ('speed_learner',  'Học siêu tốc',          'Hoàn thành khoá trong 1 ngày',        150);

COMMIT;
