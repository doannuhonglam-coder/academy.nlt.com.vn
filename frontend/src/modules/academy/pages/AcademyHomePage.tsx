import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import ProgressBar from '../components/ProgressBar';
import CourseCard from '../components/CourseCard';
import type { LearnerDashboard, PaginatedResponse, CourseBrief } from '../types/academy.types';
import { API_PREFIX, STALE_TIME } from '../constants/academy.constants';

async function fetchDashboard(): Promise<LearnerDashboard> {
  const res = await fetch(`${API_PREFIX}/me/dashboard`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

async function fetchFeaturedCourses(): Promise<PaginatedResponse<CourseBrief>> {
  const res = await fetch(`${API_PREFIX}/courses?per_page=3`);
  return res.json();
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'sáng';
  if (h < 18) return 'chiều';
  return 'tối';
}

export default function AcademyHomePage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['academy-dashboard'],
    queryFn: fetchDashboard,
    staleTime: STALE_TIME.DASHBOARD,
  });
  const { data: featured } = useQuery({
    queryKey: ['academy-courses-featured'],
    queryFn: fetchFeaturedCourses,
    staleTime: STALE_TIME.COURSES,
  });

  const stats   = dashboard?.stats;
  const streak  = dashboard?.streak;
  const active  = dashboard?.active_lesson;
  const challenge = dashboard?.daily_challenge;
  const nameParts = dashboard?.person.display_name?.split(' ');
  const name      = (nameParts && nameParts[nameParts.length - 1]) ?? 'bạn';

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar role="member" />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 pb-24 md:pb-8 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 md:p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0">

              {/* ── Streak at-risk ── */}
              {streak?.streak_at_risk && (
                <div className="mx-4 mt-4 bg-orange-500/15 border border-orange-500/25 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-orange-300">Streak sắp mất!</p>
                    <p className="text-xs text-orange-400/80 mt-0.5">Học ít nhất 1 bài hôm nay để giữ chuỗi.</p>
                  </div>
                  <button
                    onClick={() => navigate('/academy')}
                    className="ml-auto bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    Học ngay
                  </button>
                </div>
              )}

              {/* ── Hero welcome ── */}
              <div className="relative overflow-hidden mx-4 mt-4 rounded-2xl bg-gradient-to-br from-coral-500 via-orange-400 to-gold-400 p-5 md:p-6">
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 right-16 w-16 h-16 rounded-full bg-white/10" />
                <div className="relative z-10">
                  <p className="text-white/80 text-sm mb-0.5">Chào buổi {greeting()},</p>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{name}! 👋</h2>

                  {/* Streak badge */}
                  {streak && streak.current_streak > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                      <span>🔥</span>
                      <span className="text-sm font-bold text-white">{streak.current_streak} ngày liên tiếp</span>
                    </div>
                  )}

                  {/* Quick stats inline */}
                  {stats && (
                    <div className="flex gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">⚡{stats.total_xp}</p>
                        <p className="text-[10px] text-white/70">XP</p>
                      </div>
                      <div className="w-px bg-white/20" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{stats.lessons_completed}</p>
                        <p className="text-[10px] text-white/70">Bài học</p>
                      </div>
                      <div className="w-px bg-white/20" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{stats.certs_earned}</p>
                        <p className="text-[10px] text-white/70">Chứng chỉ</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Continue Learning ── */}
              <div className="px-4 mt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  {active ? '▶ Tiếp tục học' : '🎯 Bắt đầu ngay'}
                </h3>
                <div
                  onClick={() => active
                    ? navigate(`/training/lessons/${active.lesson_id}`)
                    : navigate('/academy')
                  }
                  className="bg-gray-900 border border-white/8 rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform hover:border-white/15"
                >
                  {active ? (
                    <div className="flex gap-4 items-start">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-500/30 to-gold-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {active.lesson_type === 'video' ? '🎬' : active.lesson_type === 'quiz' ? '❓' : '📖'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-400 mb-0.5">ĐANG HỌC</p>
                        <p className="text-sm font-bold text-white truncate">{active.course_title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{active.lesson_title}</p>
                        <div className="mt-2.5">
                          <ProgressBar value={active.progress_pct} color="teal" showLabel height="sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Chưa học khoá nào</p>
                        <p className="text-xs text-gray-400 mt-0.5">Hãy chọn khoá học phù hợp với bạn</p>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        <span className="bg-coral-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Khám phá →</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Daily Challenge ── */}
              {challenge && (
                <div className="px-4 mt-4">
                  <div className="bg-gradient-to-r from-violet-900/50 to-violet-800/30 border border-violet-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⚡</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">THÁCH THỨC HÔM NAY</p>
                        <p className="text-sm text-white font-medium mt-0.5">{challenge.challenge_description}</p>
                        <p className="text-xs text-violet-300 mt-0.5">+{challenge.xp_reward} XP</p>
                      </div>
                      <button
                        onClick={() => navigate('/academy')}
                        disabled={challenge.is_completed_today}
                        className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                          challenge.is_completed_today
                            ? 'bg-teal-500/20 text-teal-300'
                            : 'bg-violet-600 hover:bg-violet-700 text-white active:scale-95'
                        }`}
                      >
                        {challenge.is_completed_today ? '✓ Xong' : 'Bắt đầu'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Quick Stats Cards ── */}
              {stats && (
                <div className="px-4 mt-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Thành tích của bạn</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '⏱', value: `${stats.hours_learned}h`, label: 'Giờ học', to: '/training/profile', color: 'text-blue-400' },
                      { icon: '🏆', value: `${stats.certs_earned}`, label: 'Chứng chỉ NLT', to: '/training/profile', color: 'text-gold-400' },
                    ].map(s => (
                      <button
                        key={s.label}
                        onClick={() => navigate(s.to)}
                        className="bg-gray-900 border border-white/8 rounded-xl p-4 text-left hover:border-white/15 active:scale-95 transition-all"
                      >
                        <span className="text-2xl block mb-2">{s.icon}</span>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Featured Courses ── */}
              {(featured?.data?.length ?? 0) > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h3 className="text-sm font-bold text-white">🔥 Khoá học nổi bật</h3>
                    <button
                      onClick={() => navigate('/academy')}
                      className="text-xs text-coral-400 hover:text-coral-300"
                    >
                      Xem tất cả →
                    </button>
                  </div>
                  <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured!.data.slice(0, 3).map(c => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
