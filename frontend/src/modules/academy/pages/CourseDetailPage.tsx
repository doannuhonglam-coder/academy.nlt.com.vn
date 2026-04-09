import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import ProgressBar from '../components/ProgressBar';
import type { CourseDetailWithProgress } from '../types/academy.types';
import { API_PREFIX, STALE_TIME, LESSON_TYPE_ICON } from '../constants/academy.constants';

async function fetchCourseDetail(slug: string): Promise<CourseDetailWithProgress> {
  const res = await fetch(`${API_PREFIX}/courses/${slug}`);
  if (!res.ok) throw new Error('Course not found');
  return res.json();
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['academy-course-detail', slug],
    queryFn: () => fetchCourseDetail(slug!),
    staleTime: STALE_TIME.LESSON,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 flex items-center justify-center text-gray-400">Đang tải...</div>
        <MobileBottomNav />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 px-6">
          <span className="text-4xl">😕</span>
          <p className="text-base font-bold text-white">Không tìm thấy khoá học</p>
          <button onClick={() => navigate('/academy')} className="text-sm text-coral-400 hover:underline">
            ← Quay lại khám phá
          </button>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const { course, enrollment } = data;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar role="member" />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <div className="flex flex-1 min-w-0">
          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 pb-24 md:pb-8 overflow-y-auto">

            {/* Course hero */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border-b border-white/5 px-4 md:px-6 pt-5 pb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-transparent pointer-events-none" />
              <div className="relative">
                <span className="text-xs font-bold uppercase tracking-wider text-coral-400 mb-2 block">
                  {course.content_type === 'internal' ? '🔒 Nội bộ' : '🌐 Cộng đồng'}
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">{course.title}</h1>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">{course.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
                  <span className="flex items-center gap-1"><span>📚</span>{course.lesson_count} bài học</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><span>⏱</span>{course.estimated_minutes} phút</span>
                  {course.avg_rating && (
                    <><span>·</span><span className="text-yellow-400 font-medium">⭐ {course.avg_rating}</span></>
                  )}
                </div>

                {/* Mobile: inline progress if enrolled */}
                {enrollment && (
                  <div className="mb-4 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-medium">Tiến độ của bạn</span>
                      <span className="text-sm font-bold text-teal-400">{Math.round(enrollment.progress_pct)}%</span>
                    </div>
                    <ProgressBar value={enrollment.progress_pct} color="teal" height="sm" />
                    <div className="flex gap-4 mt-2 text-[11px] text-gray-500">
                      <span>✅ {enrollment.lessons_completed}/{enrollment.total_lessons} bài</span>
                      <span>⚡ {enrollment.xp_earned} XP</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    const firstLesson = course.modules?.[0]?.lessons?.[0];
                    if (firstLesson) navigate(`/training/lessons/${firstLesson.id}`);
                  }}
                  className="w-full md:w-auto bg-coral-500 hover:bg-coral-600 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
                >
                  {enrollment?.status === 'completed' ? '✓ Ôn lại khoá học' : enrollment ? '▶ Tiếp tục học' : '🚀 Bắt đầu học miễn phí'}
                </button>
              </div>
            </div>

            {/* Modules + Lessons */}
            <div className="px-4 md:px-6 py-5 space-y-4">
              <h2 className="text-sm font-bold text-white">Nội dung khoá học</h2>

              {course.modules.map(mod => (
                <div key={mod.module_title}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{mod.module_title}</p>
                  <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                    {mod.lessons.map((lesson, i) => (
                      <div
                        key={lesson.id}
                        onClick={() => navigate(`/training/lessons/${lesson.id}`)}
                        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-white/8 hover:bg-white/5 transition-colors ${
                          i < mod.lessons.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{LESSON_TYPE_ICON[lesson.lesson_type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{lesson.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{lesson.estimated_minutes} phút · <span className="text-gold-400">+{lesson.xp_reward} XP</span></p>
                        </div>
                        {lesson.is_previewable && (
                          <span className="text-[10px] text-teal-400 font-bold flex-shrink-0 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                            Xem trước
                          </span>
                        )}
                        <span className="text-gray-600 text-sm flex-shrink-0">›</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Offline download */}
              {course.is_offline_available && (
                <div className="p-4 bg-teal-500/8 border border-teal-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">📱 Tải về học offline</p>
                    <p className="text-xs text-gray-400 mt-0.5">~{course.offline_size_mb} MB · Học không cần internet</p>
                  </div>
                  <button className="text-sm font-bold px-4 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/30 active:scale-95 transition-all flex-shrink-0 ml-3">
                    ⬇ Tải
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* ── Right sidebar — desktop only ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0 p-5 border-l border-white/5 sticky top-14 self-start max-h-screen overflow-y-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Tiến độ của bạn</h3>
              {enrollment ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-24 h-24 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#06D6A0" strokeWidth="3"
                          strokeDasharray={`${enrollment.progress_pct} ${100 - enrollment.progress_pct}`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{Math.round(enrollment.progress_pct)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-base font-bold text-white">{enrollment.lessons_completed}/{enrollment.total_lessons}</p>
                      <p className="text-[10px] text-gray-400">bài học</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-base font-bold text-white">⚡ {enrollment.xp_earned}</p>
                      <p className="text-[10px] text-gray-400">XP kiếm được</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">Chưa tham gia khoá học</p>
                  <p className="text-xs mt-1">Bấm "Bắt đầu học" để đăng ký</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
