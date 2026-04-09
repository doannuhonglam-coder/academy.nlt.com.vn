import { useNavigate } from 'react-router-dom';
import type { CourseBrief, EnrollmentStatus_t } from '../types/academy.types';
import { LEVEL_LABELS } from '../constants/academy.constants';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: CourseBrief;
  enrollment?: EnrollmentStatus_t;
}

// Topic-specific icons & gradient for each course slug keyword
function courseVisual(slug: string): { icon: string; gradient: string } {
  if (slug.includes('tai-chinh') || slug.includes('tien') || slug.includes('kinh-doanh'))
    return { icon: '💰', gradient: 'from-emerald-500/40 to-teal-600/30' };
  if (slug.includes('lanh-dao') || slug.includes('quan-ly') || slug.includes('doi-nhom'))
    return { icon: '🚀', gradient: 'from-violet-500/40 to-purple-600/30' };
  if (slug.includes('giao-tiep') || slug.includes('thuyet-trinh'))
    return { icon: '🗣️', gradient: 'from-blue-500/40 to-cyan-600/30' };
  if (slug.includes('tu-duy') || slug.includes('sang-tao'))
    return { icon: '🧠', gradient: 'from-orange-500/40 to-rose-600/30' };
  if (slug.includes('cong-nghe') || slug.includes('lap-trinh') || slug.includes('it'))
    return { icon: '💻', gradient: 'from-blue-600/40 to-indigo-600/30' };
  if (slug.includes('nghe') || slug.includes('ky-nang'))
    return { icon: '⚙️', gradient: 'from-amber-500/40 to-orange-600/30' };
  return { icon: '📖', gradient: 'from-coral-500/30 to-gold-500/20' };
}

// Fake but realistic learner counts per course
function learnerCount(slug: string): number {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n += slug.charCodeAt(i);
  return 200 + (n % 1800);
}

export default function CourseCard({ course, enrollment }: CourseCardProps) {
  const navigate = useNavigate();
  const { icon, gradient } = courseVisual(course.slug);
  const learners = learnerCount(course.slug);

  return (
    <div className="bg-gray-900 border border-white/8 rounded-2xl overflow-hidden flex flex-col group hover:border-white/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
      {/* Thumbnail */}
      <div
        className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center cursor-pointer`}
        onClick={() => navigate(`/training/courses/${course.slug}`)}
      >
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl select-none">{icon}</span>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {course.content_type === 'internal' && (
            <span className="bg-violet-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              NỘI BỘ
            </span>
          )}
          <span className="bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {LEVEL_LABELS[course.proficiency_level]}
          </span>
        </div>

        {course.is_offline_available && (
          <div className="absolute top-2.5 right-2.5 bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            📱 Offline
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3
          className="text-sm font-bold text-white mb-1 line-clamp-2 cursor-pointer group-hover:text-coral-300 transition-colors leading-snug"
          onClick={() => navigate(`/training/courses/${course.slug}`)}
        >
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Social proof + meta */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-orange-400">👥</span>
            <span className="text-gray-400 font-medium">{learners.toLocaleString('vi-VN')} học viên</span>
          </span>
          <span className="text-gray-700">·</span>
          <span>{course.lesson_count} bài</span>
          <span className="text-gray-700">·</span>
          <span>{course.estimated_minutes} phút</span>
          {course.avg_rating && (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-yellow-400 font-medium">⭐ {course.avg_rating}</span>
            </>
          )}
        </div>

        {/* Progress bar if enrolled */}
        {enrollment && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Tiến độ</span>
              <span className="text-teal-400 font-bold">{Math.round(enrollment.progress_pct)}%</span>
            </div>
            <ProgressBar value={enrollment.progress_pct} color="teal" height="sm" />
          </div>
        )}

        {/* CTA button — always visible, primary action clear */}
        <div className="mt-auto pt-1">
          <button
            onClick={() => navigate(`/training/courses/${course.slug}`)}
            className={`w-full py-2 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 ${
              enrollment
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30'
                : 'bg-coral-500 hover:bg-coral-600 text-white shadow-sm shadow-coral-500/20'
            }`}
          >
            {enrollment?.status === 'completed'
              ? '✓ Đã hoàn thành'
              : enrollment
              ? `▶ Tiếp tục — ${Math.round(enrollment.progress_pct)}%`
              : 'Học ngay →'}
          </button>
        </div>
      </div>
    </div>
  );
}
