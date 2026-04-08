import { useNavigate } from 'react-router-dom';
import type { CourseBrief, EnrollmentStatus_t } from '../types/academy.types';
import { LEVEL_LABELS } from '../constants/academy.constants';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: CourseBrief;
  enrollment?: EnrollmentStatus_t;
}

const gradients = [
  'from-coral-500/30 to-gold-500/20',
  'from-teal-500/30 to-violet-500/20',
  'from-violet-500/30 to-coral-500/20',
  'from-gold-500/30 to-teal-500/20',
];

function cardGradient(slug: string) {
  const idx = slug.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function CourseCard({ course, enrollment }: CourseCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/training/courses/${course.slug}`)}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-white/20 hover:bg-white/8 transition-all group"
    >
      {/* Thumbnail */}
      <div className={`h-28 bg-gradient-to-br ${cardGradient(course.slug)} flex items-center justify-center relative`}>
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-60">📚</span>
        )}
        {course.is_offline_available && (
          <span className="absolute top-2 right-2 bg-teal-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            OFFLINE
          </span>
        )}
        {course.content_type === 'internal' && (
          <span className="absolute top-2 left-2 bg-violet-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            NỘI BỘ
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-coral-400">
          {LEVEL_LABELS[course.proficiency_level]}
        </span>
        <h3 className="text-sm font-bold text-white mt-1 mb-1 line-clamp-2 group-hover:text-coral-300 transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{course.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
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

        {/* Progress if enrolled */}
        {enrollment && (
          <div className="mt-2">
            <ProgressBar value={enrollment.progress_pct} color="teal" showLabel height="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
