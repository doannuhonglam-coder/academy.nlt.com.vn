import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import ProgressBar from '../components/ProgressBar';
import type { CourseDetailWithProgress, LessonWithStatus } from '../types/academy.types';
import { API_PREFIX, STALE_TIME, LESSON_TYPE_ICON } from '../constants/academy.constants';

async function fetchCourseDetail(slug: string): Promise<CourseDetailWithProgress> {
  const res = await fetch(`${API_PREFIX}/courses/${slug}`);
  if (!res.ok) throw new Error('Course not found');
  return res.json();
}

function statusIcon(status: LessonWithStatus['status']) {
  if (status === 'completed') return <span className="text-teal-400">✓</span>;
  if (status === 'locked') return <span className="text-gray-600">🔒</span>;
  return <span className="w-5 h-5 rounded-full border-2 border-coral-500 inline-block" />;
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
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Không tìm thấy khoá học</div>
      </div>
    );
  }

  const { course, enrollment } = data;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar role="member" />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-1 gap-0">
          {/* Main left */}
          <main className="flex-1 p-6">
            {/* Course Hero */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-academy-dark to-academy-purple border border-white/10 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-coral-400 mb-2 block">
                {course.content_type === 'internal' ? '🔒 Nội bộ' : '🌐 Cộng đồng'}
              </span>
              <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-sm text-gray-400 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                <span>{course.lesson_count} bài</span>
                <span>·</span>
                <span>{course.estimated_minutes} phút</span>
                {course.avg_rating && (
                  <>
                    <span>·</span>
                    <span>⭐ {course.avg_rating}</span>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  const firstLesson = course.modules?.[0]?.lessons?.[0];
                  if (firstLesson) navigate(`/training/lessons/${firstLesson.id}`);
                }}
                className="bg-coral-500 hover:bg-coral-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
              >
                {enrollment?.status === 'completed' ? '✓ Hoàn thành' : enrollment ? 'Tiếp tục học' : 'Bắt đầu học'}
              </button>
            </div>

            {/* Modules + Lessons */}
            {course.modules.map(mod => (
              <div key={mod.module_title} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">{mod.module_title}</h3>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                  {mod.lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      onClick={() => navigate(`/training/lessons/${lesson.id}`)}
                      className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${
                        i < mod.lessons.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <span className="text-base">{LESSON_TYPE_ICON[lesson.lesson_type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{lesson.title}</p>
                        <p className="text-[11px] text-gray-500">{lesson.estimated_minutes} phút · {lesson.xp_reward} XP</p>
                      </div>
                      {lesson.is_previewable && (
                        <span className="text-[10px] text-teal-400 font-bold">Xem trước</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Offline download */}
            {course.is_offline_available && (
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Tải về offline</p>
                  <p className="text-xs text-gray-400">~{course.offline_size_mb} MB</p>
                </div>
                <button className="text-sm font-bold px-4 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/30 transition-colors">
                  ⬇ Tải về
                </button>
              </div>
            )}
          </main>

          {/* Right sticky panel */}
          <aside className="w-72 flex-shrink-0 p-5 border-l border-white/5 sticky top-14 self-start">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Tiến độ của bạn</h3>

              {enrollment ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-24 h-24 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="#06D6A0" strokeWidth="3"
                          strokeDasharray={`${enrollment.progress_pct} ${100 - enrollment.progress_pct}`}
                          strokeLinecap="round"
                        />
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
    </div>
  );
}
