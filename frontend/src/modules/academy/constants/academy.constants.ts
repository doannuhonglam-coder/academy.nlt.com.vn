// Academy.nlt — App-wide constants

export const XP_PER_LEVEL = 500;          // XP needed per level
export const STREAK_AT_RISK_HOUR = 20;    // After 8pm if no activity → streak at risk

// XP rewards (mirrors DB defaults)
export const XP = {
  LESSON_COMPLETE: 20,
  QUIZ_CORRECT: 15,
  COURSE_COMPLETE: 100,
  BADGE_BONUS_BASE: 50,
} as const;

// Badge thresholds
export const BADGE_THRESHOLDS = {
  STREAK_3: 3,
  STREAK_7: 7,
  STREAK_30: 30,
  QUIZ_PERFECT_SCORE: 100, // %
} as const;

// Offline limits
export const OFFLINE = {
  MAX_COURSES: 5,
  MAX_TOTAL_MB: 2048,       // 2 GB
  WARN_BELOW_MB: 200,
  MAX_QUEUE_EVENTS: 100,
  SYNC_INTERVAL_MS: 30 * 60 * 1000,  // 30 minutes
  MAX_RETRY_COUNT: 3,
  BATCH_SIZE: 100,
} as const;

// Proficiency level labels (Vietnamese)
export const LEVEL_LABELS: Record<string, string> = {
  L1: 'Cơ bản',
  L2: 'Trung cấp',
  L3: 'Nâng cao',
  L4: 'Chuyên gia',
};

// Lesson type icons
export const LESSON_TYPE_ICON: Record<string, string> = {
  video: '🎬',
  reading: '📖',
  quiz: '❓',
  project: '🛠️',
};

// SLA timeouts (ms) for React Query
export const STALE_TIME = {
  COURSES: 5 * 60 * 1000,   // 5 min
  DASHBOARD: 60 * 1000,     // 1 min
  LESSON: 10 * 60 * 1000,   // 10 min
  GAMIFICATION: 2 * 60 * 1000,
  CERTS: 10 * 60 * 1000,
} as const;

// API base URL — empty string in dev so MSW intercepts on same origin
// Set VITE_API_BASE_URL in production to point to the real backend
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
export const API_PREFIX = `${API_BASE}/api/v1/academy`;
