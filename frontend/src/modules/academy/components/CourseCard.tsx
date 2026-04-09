import { useNavigate } from 'react-router-dom';
import type { CourseBrief, EnrollmentStatus_t, NhileTier } from '../types/academy.types';
import { LEVEL_LABELS } from '../constants/academy.constants';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: CourseBrief;
  enrollment?: EnrollmentStatus_t;
  /** Current user's Nhile Credits — used to show credit-lock progress */
  userCredits?: number;
}

function courseVisual(slug: string): { icon: string; gradient: string } {
  if (slug.includes('tai-chinh') || slug.includes('tien') || slug.includes('kinh-doanh'))
    return { icon: '💰', gradient: 'from-emerald-500/40 to-teal-600/30' };
  if (slug.includes('lanh-dao') || slug.includes('quan-ly') || slug.includes('doi-nhom'))
    return { icon: '🚀', gradient: 'from-violet-500/40 to-purple-600/30' };
  if (slug.includes('giao-tiep') || slug.includes('thuyet-trinh'))
    return { icon: '🗣️', gradient: 'from-blue-500/40 to-cyan-600/30' };
  if (slug.includes('tu-duy') || slug.includes('sang-tao'))
    return { icon: '🧠', gradient: 'from-orange-500/40 to-rose-600/30' };
  if (slug.includes('lap-trinh') || slug.includes('cong-nghe') || slug.includes('web'))
    return { icon: '💻', gradient: 'from-blue-600/40 to-indigo-600/30' };
  if (slug.includes('du-an') || slug.includes('thuc-chien') || slug.includes('marketing'))
    return { icon: '🎯', gradient: 'from-coral-500/40 to-rose-600/30' };
  if (slug.includes('chung-chi') || slug.includes('kiem-dinh'))
    return { icon: '🏆', gradient: 'from-gold-500/40 to-amber-600/30' };
  if (slug.includes('nghe') || slug.includes('ky-nang'))
    return { icon: '⚙️', gradient: 'from-amber-500/40 to-orange-600/30' };
  return { icon: '📖', gradient: 'from-coral-500/30 to-gold-500/20' };
}

function learnerCount(slug: string): number {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n += slug.charCodeAt(i);
  return 200 + (n % 1800);
}

const TIER_CONFIG: Record<NhileTier, { label: string; icon: string; badgeClass: string; desc: string }> = {
  'volunteer':         { label: 'Volunteer',      icon: '🌱', badgeClass: 'bg-teal-600/90',   desc: 'Tất cả học viên' },
  'work-and-learn':    { label: 'Work & Learn',   icon: '💼', badgeClass: 'bg-blue-600/90',   desc: 'Member kỷ luật tốt — admin duyệt' },
  'nhile-star':        { label: 'Nhile Star',     icon: '⭐', badgeClass: 'bg-gold-500/90',   desc: 'Được dẫn dắt bởi founder & leader từ doanh nghiệp thực chiến' },
  'nhile-certificate': { label: 'Certificate',    icon: '🏆', badgeClass: 'bg-violet-600/90', desc: 'Hoàn thành toàn bộ hành trình' },
};

export default function CourseCard({ course, enrollment, userCredits = 1250 }: CourseCardProps) {
  const navigate = useNavigate();
  const { icon, gradient } = courseVisual(course.slug);
  const learners = learnerCount(course.slug);
  const isLocked = course.locked;
  const isCreditLock = isLocked && !!course.required_credits && !course.required_tier;
  const isTierLock   = isLocked && !!course.required_tier;
  const tierCfg = course.required_tier ? TIER_CONFIG[course.required_tier] : null;

  // For credit-lock: progress toward required credits
  const creditPct = isCreditLock && course.required_credits
    ? Math.min((userCredits / course.required_credits) * 100, 100)
    : 0;
  const creditShortfall = isCreditLock && course.required_credits
    ? Math.max(course.required_credits - userCredits, 0)
    : 0;

  return (
    <div className={`bg-gray-900 border rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 ${
      isLocked
        ? 'border-white/5 opacity-85'
        : 'border-white/8 hover:border-white/20 hover:shadow-xl hover:shadow-black/30'
    }`}>
      {/* Thumbnail */}
      <div
        className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => !isLocked && navigate(`/training/courses/${course.slug}`)}
      >
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className={`w-full h-full object-cover ${isLocked ? 'blur-sm scale-105' : ''}`} />
        ) : (
          <span className={`text-5xl select-none ${isLocked ? 'opacity-25' : ''}`}>{icon}</span>
        )}

        {/* ── Credit-lock overlay ── */}
        {isCreditLock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/65 backdrop-blur-[2px] px-3">
            <span className="text-2xl mb-1">🪙</span>
            <span className="bg-teal-700/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full text-center">
              Cần {course.required_credits?.toLocaleString('vi-VN')} Credits
            </span>
            {/* Mini progress */}
            <div className="w-full mt-2 px-4">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${creditPct}%` }} />
              </div>
              <p className="text-[9px] text-teal-300 text-center mt-0.5">
                {userCredits.toLocaleString('vi-VN')} / {course.required_credits?.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        )}

        {/* ── Tier-lock overlay ── */}
        {isTierLock && tierCfg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/65 backdrop-blur-[2px] gap-1.5">
            <span className="text-2xl">🔒</span>
            <span className={`${tierCfg.badgeClass} backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}>
              {tierCfg.icon} {tierCfg.label}
            </span>
          </div>
        )}

        {/* Badges (only unlocked) */}
        {!isLocked && (
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {course.content_type === 'internal' && (
              <span className="bg-violet-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NỘI BỘ</span>
            )}
            <span className="bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {LEVEL_LABELS[course.proficiency_level]}
            </span>
          </div>
        )}
        {!isLocked && course.is_offline_available && (
          <div className="absolute top-2.5 right-2.5 bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            📱 Offline
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3
          className={`text-sm font-bold mb-1 line-clamp-2 leading-snug transition-colors ${
            isLocked ? 'text-gray-500 cursor-default' : 'text-white cursor-pointer group-hover:text-coral-300'
          }`}
          onClick={() => !isLocked && navigate(`/training/courses/${course.slug}`)}
        >
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Meta — unlocked */}
        {!isLocked && (
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
        )}

        {/* Credit-lock info */}
        {isCreditLock && (
          <div className="mb-3 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Credits của bạn</span>
              {creditShortfall > 0
                ? <span className="text-orange-400 font-bold">Thiếu {creditShortfall.toLocaleString('vi-VN')} 🪙</span>
                : <span className="text-teal-400 font-bold">Đủ điều kiện! ✓</span>
              }
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-300 rounded-full" style={{ width: `${creditPct}%` }} />
            </div>
            {course.total_xp && (
              <p className="text-[10px] text-gray-600">Phần thưởng: <span className="text-gold-400 font-medium">⚡ {course.total_xp} XP</span></p>
            )}
          </div>
        )}

        {/* Tier-lock info */}
        {isTierLock && tierCfg && (
          <div className="mb-3 bg-white/3 border border-white/6 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-500 leading-relaxed">{tierCfg.desc}</p>
            {course.total_xp && (
              <p className="text-[10px] text-gray-600 mt-1">Phần thưởng: <span className="text-gold-400 font-medium">⚡ {course.total_xp} XP</span></p>
            )}
          </div>
        )}

        {/* Progress bar if enrolled */}
        {enrollment && !isLocked && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Tiến độ</span>
              <span className="text-teal-400 font-bold">{Math.round(enrollment.progress_pct)}%</span>
            </div>
            <ProgressBar value={enrollment.progress_pct} color="teal" height="sm" />
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {isCreditLock ? (
            <button
              onClick={() => navigate('/academy')}
              className="w-full py-2 rounded-xl text-sm font-bold bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/15 transition-all active:scale-95"
            >
              {creditShortfall > 0 ? `🪙 Học thêm để tích Credit` : '🔓 Mở khoá ngay →'}
            </button>
          ) : isTierLock ? (
            <button
              onClick={() => navigate('/training/profile')}
              className="w-full py-2 rounded-xl text-sm font-bold bg-white/4 border border-white/8 text-gray-500 hover:bg-white/6 hover:text-gray-400 transition-all active:scale-95"
            >
              🔒 Xem yêu cầu cấp độ →
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
