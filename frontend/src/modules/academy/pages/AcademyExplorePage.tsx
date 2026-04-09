import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import CourseCard from '../components/CourseCard';
import type { CourseBrief, PaginatedResponse } from '../types/academy.types';
import { API_PREFIX, STALE_TIME } from '../constants/academy.constants';

async function fetchCourses(search: string, category: string): Promise<PaginatedResponse<CourseBrief>> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'all') params.set('category', category);
  const res = await fetch(`${API_PREFIX}/courses?${params}`);
  return res.json();
}

const CATEGORIES = [
  { id: 'all',        icon: '✨', label: 'Tất cả' },
  { id: 'tu-duy',     icon: '🧠', label: 'Tư duy' },
  { id: 'tai-chinh',  icon: '💰', label: 'Tài chính' },
  { id: 'giao-tiep',  icon: '🗣️', label: 'Giao tiếp' },
  { id: 'lanh-dao',   icon: '🚀', label: 'Lãnh đạo' },
  { id: 'ki-nang-mem',icon: '⚙️', label: 'Kỹ năng nghề' },
  { id: 'cong-nghe',  icon: '💻', label: 'Công nghệ' },
  { id: 'kinh-doanh', icon: '📊', label: 'Kinh doanh' },
];

// Stats for hero social proof
const PLATFORM_STATS = [
  { icon: '👨‍🎓', value: '12,000+', label: 'Học viên' },
  { icon: '📚', value: '30+',     label: 'Khoá học' },
  { icon: '🏆', value: '2,400+',  label: 'Chứng chỉ' },
];

export default function AcademyExplorePage() {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('all');
  const [offlineOnly, setOffline] = useState(false);
  const [searchInput, setInput]   = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['academy-courses', search, category],
    queryFn: () => fetchCourses(search, category),
    staleTime: STALE_TIME.COURSES,
  });

  const courses = (data?.data ?? []).filter(c => !offlineOnly || c.is_offline_available);

  const handleSearch = (val: string) => {
    setInput(val);
    if (val.length === 0 || val.length >= 2) setSearch(val);
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 pb-20 md:pb-6">

          {/* ── Hero Banner ─────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-b border-white/5 px-4 md:px-8 pt-8 pb-6 md:pt-10 md:pb-8">
            {/* Background blobs */}
            <div className="absolute inset-0 bg-gradient-to-br from-coral-500/6 via-transparent to-teal-500/6 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-coral-500/4 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-gold-500/4 blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl">
              {/* Label */}
              <div className="inline-flex items-center gap-2 bg-coral-500/15 border border-coral-500/20 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse" />
                <span className="text-xs font-bold text-coral-400 uppercase tracking-wider">Học nghề thực chiến</span>
              </div>

              {/* Main slogan */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
                Kỹ năng thật.{' '}
                <span className="bg-gradient-to-r from-coral-400 via-gold-400 to-teal-400 bg-clip-text text-transparent">
                  Dự án thật.
                </span>
                {' '}Tương lai thật.
              </h1>
              <p className="text-sm text-gray-400 mb-5 max-w-md leading-relaxed">
                Học xong là làm được. Làm được là thăng tiến — không lý thuyết suông, không slide nhàm chán.
              </p>

              {/* Search bar */}
              <div className="relative max-w-lg mb-6">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Tìm khoá học bạn muốn học..."
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-coral-500/60 focus:bg-white/10 transition-all"
                />
              </div>

              {/* ── Tier Journey ── */}
              <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Hành trình của bạn</p>
                <div className="flex items-center gap-1">
                  {/* Volunteer */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center mb-1.5 ring-2 ring-teal-400/30">
                      <span className="text-lg">🌱</span>
                    </div>
                    <p className="text-[10px] font-bold text-teal-400">Volunteer</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Học &amp; tích<br/>Nhile Credit</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center px-1">
                    <div className="h-px w-6 bg-gradient-to-r from-teal-500/50 to-gold-500/50" />
                    <span className="text-gray-600 text-xs">›</span>
                  </div>

                  {/* Nhile Star */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-gold-500/15 border-2 border-gold-400/40 border-dashed flex items-center justify-center mb-1.5">
                      <span className="text-lg opacity-60">⭐</span>
                    </div>
                    <p className="text-[10px] font-bold text-gold-400/60">Nhile Star</p>
                    <p className="text-[9px] text-gray-600 mt-0.5 leading-tight">Làm dự án<br/>thực tế</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center px-1">
                    <div className="h-px w-6 bg-gradient-to-r from-gold-500/30 to-violet-500/30" />
                    <span className="text-gray-700 text-xs">›</span>
                  </div>

                  {/* Nhile Certificate */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 border-2 border-violet-400/25 border-dashed flex items-center justify-center mb-1.5">
                      <span className="text-lg opacity-40">🏆</span>
                    </div>
                    <p className="text-[10px] font-bold text-violet-400/50">Certificate</p>
                    <p className="text-[9px] text-gray-600 mt-0.5 leading-tight">Chứng chỉ<br/>được công nhận</p>
                  </div>
                </div>

                {/* Progress note */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">Bạn đang ở: <span className="text-teal-400 font-bold">🌱 Volunteer</span></p>
                  <button className="text-[10px] text-coral-400 font-bold hover:text-coral-300">Xem quyền lợi →</button>
                </div>
              </div>

              {/* Platform stats */}
              <div className="flex items-center gap-5">
                {PLATFORM_STATS.map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-sm font-bold text-white">{s.value}</span>
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Category Pills (horizontal scroll) ──────── */}
          <div className="px-4 md:px-8 py-4 border-b border-white/5 overflow-x-auto">
            <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    category === cat.id
                      ? 'bg-coral-500 text-white shadow-sm shadow-coral-500/30'
                      : 'bg-white/5 text-gray-300 border border-white/8 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}

              {/* Offline toggle as pill */}
              <button
                onClick={() => setOffline(!offlineOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  offlineOnly
                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/8 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>📱</span>
                <span>Học offline</span>
              </button>
            </div>
          </div>

          {/* ── Course Grid ─────────────────────────────── */}
          <div className="px-4 md:px-8 py-6">
            {/* Result header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">
                  {search
                    ? `Kết quả cho "${search}"`
                    : category !== 'all'
                    ? CATEGORIES.find(c => c.id === category)?.label ?? 'Khoá học'
                    : 'Tất cả khoá học'}
                </h2>
                {!isLoading && (
                  <p className="text-xs text-gray-500 mt-0.5">{courses.length} khoá học</p>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-base font-medium text-gray-300">Không tìm thấy khoá học nào</p>
                <p className="text-sm mt-1">Thử tìm với từ khoá khác nhé</p>
                <button
                  onClick={() => { setSearch(''); setInput(''); setCategory('all'); }}
                  className="mt-4 text-sm text-coral-400 hover:underline"
                >
                  Xem tất cả khoá học
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
