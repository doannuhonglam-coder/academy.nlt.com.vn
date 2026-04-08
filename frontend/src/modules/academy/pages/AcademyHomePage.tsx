import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
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

  const stats = dashboard?.stats;
  const streak = dashboard?.streak;
  const active = dashboard?.active_lesson;
  const challenge = dashboard?.daily_challenge;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar role="member" />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 max-w-4xl">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* 1. Streak at-risk warning */}
              {streak?.streak_at_risk && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm text-orange-300">
                    Streak của bạn sắp mất! Học ít nhất 1 bài hôm nay.
                  </p>
                </div>
              )}

              {/* 2. Welcome Hero */}
              <div className="relative rounded-2xl p-6 overflow-hidden bg-gradient-to-r from-coral-500 via-gold-500 to-teal-400">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 right-20 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white">
                    Chào buổi {greeting()}, {dashboard?.person.display_name}! 👋
                  </h2>
                  {streak && streak.current_streak > 0 && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm font-bold text-white">{streak.current_streak} ngày liên tiếp</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Stats Row */}
              {stats && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: '⚡', value: `${stats.total_xp}`, label: 'NLT XP', to: '/training/profile' },
                    { icon: '📖', value: `${stats.lessons_completed}`, label: 'bài học', to: '/training/profile' },
                    { icon: '⏱', value: `${stats.hours_learned}h`, label: 'giờ học', to: '/training/profile' },
                    { icon: '🏆', value: `${stats.certs_earned}`, label: 'chứng chỉ', to: '/training/profile' },
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => navigate(s.to)}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:border-white/20 hover:bg-white/8 transition-all"
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-xl font-bold text-white">{s.value}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* 4. Continue Card */}
              <div
                className="rounded-2xl p-6 cursor-pointer bg-gradient-to-r from-academy-dark to-academy-purple border border-white/10 hover:border-white/20 transition-all"
                onClick={() =>
                  active
                    ? navigate(`/training/lessons/${active.lesson_id}`)
                    : navigate('/academy')
                }
              >
                {active ? (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-coral-400">ĐANG HỌC</span>
                    <h3 className="text-base font-bold text-white mt-1">{active.course_title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{active.lesson_title}</p>
                    <ProgressBar value={active.progress_pct} color="teal" showLabel />
                    <button className="mt-4 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                      ▶ Học tiếp
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Bắt đầu hành trình học!</h3>
                      <p className="text-sm text-gray-400 mt-1">Khám phá hàng chục khoá học chất lượng</p>
                    </div>
                    <button className="bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
                      Khám phá →
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Featured Courses */}
              {(featured?.data?.length ?? 0) > 0 && (
                <div>
                  <h2 className="text-base font-bold text-white mb-3">Khoá học nổi bật</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {featured!.data.slice(0, 3).map(c => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Daily Challenge */}
              {challenge && (
                <div className="rounded-2xl p-5 bg-gradient-to-r from-violet-900/60 to-violet-700/40 border border-violet-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">Thử thách hôm nay</p>
                      <p className="text-sm text-white">{challenge.challenge_description}</p>
                      <p className="text-xs text-violet-300 mt-1">⚡ +{challenge.xp_reward} XP</p>
                    </div>
                    <button
                      onClick={() => navigate('/academy')}
                      disabled={challenge.is_completed_today}
                      className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                        challenge.is_completed_today
                          ? 'bg-teal-500/30 text-teal-300 cursor-default'
                          : 'bg-violet-600 hover:bg-violet-700 text-white'
                      }`}
                    >
                      {challenge.is_completed_today ? '✓ Hoàn thành' : 'Bắt đầu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
