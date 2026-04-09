import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import type {
  CourseBrief,
  CourseDetailWithProgress,
  LearnerDashboard,
  LessonContent,
  LessonCompleteResult,
  QuizQuestion,
  QuizResult,
  GamificationState,
  MyCertsResponse,
  TeamProgressSummary,
  NDataOverview,
  PaginatedResponse,
} from '../types/academy.types';

const BASE = '/api/v1/academy';

// ─── Fixture data ─────────────────────────────────────────────────────────────

const mockCourses: CourseBrief[] = [
  {
    id: 'course-1',
    slug: 'tu-duy-phan-bien',
    title: 'Tư Duy Phản Biện',
    description: 'Học cách đặt câu hỏi đúng và phân tích thông tin hiệu quả.',
    content_type: 'community',
    proficiency_level: 'L1',
    thumbnail_url: null,
    lesson_count: 8,
    estimated_minutes: 120,
    total_xp: 400,
    avg_rating: 4.7,
    rating_count: 123,
    is_offline_available: true,
    offline_size_mb: 45,
    is_published: true,
  },
  {
    id: 'course-2',
    slug: 'quan-ly-tai-chinh-ca-nhan',
    title: 'Quản Lý Tài Chính Cá Nhân',
    description: 'Kiểm soát chi tiêu, đầu tư thông minh và xây dựng tự do tài chính.',
    content_type: 'community',
    proficiency_level: 'L2',
    thumbnail_url: null,
    lesson_count: 12,
    estimated_minutes: 180,
    total_xp: 600,
    avg_rating: 4.9,
    rating_count: 87,
    is_offline_available: false,
    offline_size_mb: null,
    is_published: true,
  },
  {
    id: 'course-3',
    slug: 'lanh-dao-doi-nhom',
    title: 'Lãnh Đạo Đội Nhóm',
    description: 'Xây dựng đội ngũ hiệu quả và truyền cảm hứng cho team.',
    content_type: 'internal',
    proficiency_level: 'L3',
    thumbnail_url: null,
    lesson_count: 10,
    estimated_minutes: 150,
    total_xp: 500,
    avg_rating: 4.8,
    rating_count: 56,
    is_offline_available: true,
    offline_size_mb: 78,
    is_published: true,
  },
  {
    // Credit-locked: cần 500 Nhile Credits để mở
    id: 'course-4',
    slug: 'ky-nang-thuyet-trinh-nang-cao',
    title: 'Kỹ Năng Thuyết Trình Nâng Cao',
    description: 'Khoá học chuyên sâu — mở khoá bằng Nhile Credits tích lũy từ quá trình học.',
    content_type: 'community',
    proficiency_level: 'L3',
    thumbnail_url: null,
    lesson_count: 10,
    estimated_minutes: 180,
    total_xp: 600,
    avg_rating: 4.6,
    rating_count: 0,
    is_offline_available: false,
    offline_size_mb: null,
    is_published: true,
    locked: true,
    required_credits: 500,
  },
  {
    // Tier-locked: Work & Learn — admin duyệt
    id: 'course-5',
    slug: 'du-an-thuc-chien-marketing',
    title: 'Dự Án Thực Chiến: Marketing 0đ',
    description: 'Tham gia dự án thật, tạo chiến dịch marketing từ đầu cho doanh nghiệp địa phương.',
    content_type: 'internal',
    proficiency_level: 'L3',
    thumbnail_url: null,
    lesson_count: 6,
    estimated_minutes: 240,
    total_xp: 900,
    avg_rating: null,
    rating_count: 0,
    is_offline_available: false,
    offline_size_mb: null,
    is_published: true,
    locked: true,
    required_tier: 'work-and-learn',
  },
  {
    // Tier-locked: Nhile Star — chỉ Co-lead/Leader
    id: 'course-6',
    slug: 'lap-trinh-web-thuc-chien',
    title: 'Lập Trình Web Thực Chiến',
    description: 'Xây dựng sản phẩm web thật từ A-Z. Học và làm cùng founder, leader từ các công ty thực chiến.',
    content_type: 'internal',
    proficiency_level: 'L3',
    thumbnail_url: null,
    lesson_count: 20,
    estimated_minutes: 600,
    total_xp: 1200,
    avg_rating: null,
    rating_count: 0,
    is_offline_available: false,
    offline_size_mb: null,
    is_published: true,
    locked: true,
    required_tier: 'nhile-star',
  },
  {
    // Tier-locked: Nhile Certificate — sau khi hoàn thành hành trình
    id: 'course-7',
    slug: 'chung-chi-ky-nang-mem-nlt',
    title: 'Chứng Chỉ Kỹ Năng Mềm NLT',
    description: 'Khoá kiểm định cuối hành trình — hoàn thành để nhận giấy chứng nhận NLT.',
    content_type: 'internal',
    proficiency_level: 'L4',
    thumbnail_url: null,
    lesson_count: 5,
    estimated_minutes: 90,
    total_xp: 500,
    avg_rating: null,
    rating_count: 0,
    is_offline_available: false,
    offline_size_mb: null,
    is_published: true,
    locked: true,
    required_tier: 'nhile-certificate',
  },
];

const mockDashboard: LearnerDashboard = {
  person: { id: 'user-1', display_name: 'Nguyễn Văn A', avatar_url: null },
  stats: {
    total_xp: 1250,
    current_level: 3,
    lessons_completed: 24,
    hours_learned: 12.5,
    certs_earned: 1,
  },
  active_lesson: {
    course_id: 'course-1',
    course_slug: 'tu-duy-phan-bien',
    course_title: 'Tư Duy Phản Biện',
    course_thumbnail_url: null,
    lesson_id: 'lesson-3',
    lesson_title: 'Bài 3: Nhận biết ngụy biện',
    lesson_type: 'video',
    progress_pct: 37.5,
    last_active_at: new Date().toISOString(),
  },
  streak: {
    current_streak: 5,
    longest_streak: 12,
    last_activity_date: new Date().toISOString().split('T')[0],
    streak_at_risk: false,
  },
  daily_challenge: {
    xp_reward: 50,
    is_completed_today: false,
    challenge_description: 'Hoàn thành 1 bài học hôm nay',
  },
};

const mockLesson: LessonContent = {
  id: 'lesson-3',
  title: 'Bài 3: Nhận biết ngụy biện',
  lesson_type: 'video',
  lesson_order: 3,
  module_order: 1,
  estimated_minutes: 15,
  xp_reward: 20,
  is_previewable: false,
  is_published: true,
  video_stream_url: null,
  video_duration_s: 900,
  content_markdown: null,
  key_points: ['Ngụy biện ad hominem', 'Ngụy biện người rơm', 'Ngụy biện hào quang'],
  next_lesson: {
    id: 'lesson-4',
    title: 'Bài 4: Phân tích lập luận',
    lesson_type: 'reading',
    lesson_order: 4,
    module_order: 1,
    estimated_minutes: 10,
    xp_reward: 20,
    is_previewable: false,
    is_published: true,
  },
  prev_lesson: null,
  course_brief: mockCourses[0],
};

const mockQuiz: QuizQuestion[] = [
  {
    id: 'q-1',
    lesson_id: 'lesson-3',
    position: 0,
    question_text: 'Ngụy biện "ad hominem" là gì?',
    xp_reward: 15,
    options: [
      { id: 'o-1', option_text: 'Tấn công vào người nói thay vì lập luận', position: 0 },
      { id: 'o-2', option_text: 'Đưa ra ví dụ không liên quan', position: 1 },
      { id: 'o-3', option_text: 'Sử dụng số liệu sai', position: 2 },
      { id: 'o-4', option_text: 'Lặp lại luận điểm nhiều lần', position: 3 },
    ],
  },
];

const mockGamification: GamificationState = {
  total_xp: 1250,
  current_level: 3,
  xp_to_next_level: 250,
  xp_for_next_level_total: 500,
  current_streak: 5,
  longest_streak: 12,
  last_activity_date: new Date().toISOString().split('T')[0],
  badges: [
    { id: 'b-1', code: 'first_lesson', title: 'Bước đầu tiên', icon_url: null, xp_bonus: 50, awarded_at: new Date().toISOString() },
    { id: 'b-2', code: 'streak_3', title: 'Streak 3 ngày', icon_url: null, xp_bonus: 75, awarded_at: new Date().toISOString() },
  ],
  xp_history: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    xp_earned: Math.floor(Math.random() * 100),
    events_count: Math.floor(Math.random() * 5),
  })),
};

const mockCerts: MyCertsResponse = {
  earned_certs: [],
  cert_progress: [],
};

const mockTeamProgress: TeamProgressSummary[] = [
  {
    team_id: 'team-1',
    team_name: 'Team Marketing',
    member_count: 8,
    avg_completion_pct: 62.5,
    active_learners: 6,
    courses_completed: 14,
    top_courses: [
      { course_title: 'Tư Duy Phản Biện', enrollment_count: 8, avg_completion_pct: 75 },
    ],
  },
];

const mockNDataOverview: NDataOverview = {
  total_learners: 48,
  active_learners_7d: 32,
  total_events: 1240,
  events_7d: 430,
  top_courses: mockCourses.map(c => ({
    course_slug: c.slug,
    course_title: c.title,
    enrollment_count: Math.floor(Math.random() * 30) + 5,
    completion_count: Math.floor(Math.random() * 10),
    avg_quiz_score: Math.random() * 30 + 70,
  })),
  teams_overview: mockTeamProgress,
  data_as_of: new Date().toISOString(),
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // GET /courses
  http.get(`${BASE}/courses`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? '';
    const filtered = search.length >= 2
      ? mockCourses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
      : mockCourses;

    const response: PaginatedResponse<CourseBrief> = {
      data: filtered,
      meta: { total: filtered.length, page: 1, per_page: 20, has_next: false },
    };
    return HttpResponse.json(response);
  }),

  // GET /courses/:slug
  http.get(`${BASE}/courses/:slug`, ({ params }) => {
    const course = mockCourses.find(c => c.slug === params.slug);
    if (!course) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Course not found', details: {}, request_id: '' }, { status: 404 });

    const response: CourseDetailWithProgress = {
      course: {
        ...course,
        programs: [],
        modules: [
          {
            module_title: 'Module 1: Nền tảng',
            module_order: 1,
            lessons: [
              { id: 'lesson-1', title: 'Giới thiệu khoá học', lesson_type: 'video', lesson_order: 1, module_order: 1, estimated_minutes: 5, xp_reward: 10, is_previewable: true, is_published: true },
              { id: 'lesson-2', title: 'Bài 2: Định nghĩa tư duy', lesson_type: 'reading', lesson_order: 2, module_order: 1, estimated_minutes: 10, xp_reward: 20, is_previewable: false, is_published: true },
              { id: 'lesson-3', title: 'Bài 3: Nhận biết ngụy biện', lesson_type: 'video', lesson_order: 3, module_order: 1, estimated_minutes: 15, xp_reward: 20, is_previewable: false, is_published: true },
            ],
          },
        ],
      },
      enrollment: null,
      modules: [],
    };
    return HttpResponse.json(response);
  }),

  // GET /me/dashboard
  http.get(`${BASE}/me/dashboard`, () => HttpResponse.json(mockDashboard)),

  // GET /lessons/:lessonId
  http.get(`${BASE}/lessons/:lessonId`, () => HttpResponse.json(mockLesson)),

  // POST /lessons/:lessonId/complete
  http.post(`${BASE}/lessons/:lessonId/complete`, () => {
    const result: LessonCompleteResult = {
      xp_earned: 20,
      total_xp_now: 1270,
      enrollment_status: {
        id: 'enroll-1', course_id: 'course-1', status: 'in_progress',
        progress_pct: 50, lessons_completed: 4, total_lessons: 8,
        xp_earned: 100, enrolled_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(), completed_at: null,
      },
      gamification_delta: { level_up: false, new_level: null, badges_earned: [], streak_updated: 5 },
      course_completed: false,
      next_lesson: mockLesson.next_lesson,
    };
    return HttpResponse.json(result);
  }),

  // GET /lessons/:lessonId/quiz
  http.get(`${BASE}/lessons/:lessonId/quiz`, () => HttpResponse.json(mockQuiz)),

  // POST /lessons/:lessonId/quiz/submit
  http.post(`${BASE}/lessons/:lessonId/quiz/submit`, () => {
    const result: QuizResult = {
      question_id: 'q-1',
      selected_option_id: 'o-1',
      is_correct: true,
      xp_earned: 15,
      options_with_answer: [
        { id: 'o-1', option_text: 'Tấn công vào người nói thay vì lập luận', position: 0, is_correct: true, explanation: 'Đúng! Ad hominem tấn công người nói, không phải lập luận.' },
        { id: 'o-2', option_text: 'Đưa ra ví dụ không liên quan', position: 1, is_correct: false, explanation: null },
        { id: 'o-3', option_text: 'Sử dụng số liệu sai', position: 2, is_correct: false, explanation: null },
        { id: 'o-4', option_text: 'Lặp lại luận điểm nhiều lần', position: 3, is_correct: false, explanation: null },
      ],
    };
    return HttpResponse.json(result);
  }),

  // POST /events (N-Data)
  http.post(`${BASE}/events`, () => HttpResponse.json({ accepted: true })),

  // POST /events/batch
  http.post(`${BASE}/events/batch`, async ({ request }) => {
    const body = await request.json() as { events: unknown[] };
    return HttpResponse.json({ accepted_count: body.events?.length ?? 0, failed_events: [] });
  }),

  // GET /me/gamification
  http.get(`${BASE}/me/gamification`, () => HttpResponse.json(mockGamification)),

  // GET /me/certs
  http.get(`${BASE}/me/certs`, () => HttpResponse.json(mockCerts)),

  // GET /leader/team-progress
  http.get(`${BASE}/leader/team-progress`, () => HttpResponse.json(mockTeamProgress)),

  // GET /ndata/overview
  http.get(`${BASE}/ndata/overview`, () => HttpResponse.json(mockNDataOverview)),

  // GET /ndata/events/export
  http.get(`${BASE}/ndata/events/export`, () =>
    new HttpResponse('event_type,entity_id,created_at\nlesson_completed,lesson-1,2026-04-09', {
      headers: { 'Content-Type': 'text/csv' },
    }),
  ),

  // POST /cms/courses
  http.post(`${BASE}/cms/courses`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: crypto.randomUUID(), ...body, is_published: false, created_at: new Date().toISOString() }, { status: 201 });
  }),

  // PATCH /cms/courses/:slug
  http.patch(`${BASE}/cms/courses/:slug`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ slug: params.slug, ...body, updated_at: new Date().toISOString() });
  }),

  // PATCH /cms/courses/:slug/publish
  http.patch(`${BASE}/cms/courses/:slug/publish`, ({ params }) =>
    HttpResponse.json({ slug: params.slug, is_published: true, published_at: new Date().toISOString() }),
  ),
];

export const worker = setupWorker(...handlers);
