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
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 border-b border-white/5 px-4 md:px-8 py-8 md:py-10">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-coral-500/8 via-transparent to-teal-500/8 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-coral-500/5 blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-coral-500/15 border border-coral-500/20 rounded-full px-3 py-1 mb-3">
                <span className="text-xs font-bold text-coral-400 uppercase tracking-wider">🎯 Học để làm được việc</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Khoá học thực chiến<br />
                <span className="bg-gradient-to-r from-coral-400 to-gold-400 bg-clip-text text-transparent">cho người Việt trẻ</span>
              </h1>
              <p className="text-sm text-gray-400 mb-5 max-w-md leading-relaxed">
                Không lý thuyết suông. Học xong áp dụng được ngay — tại công việc, trong cuộc sống.
              </p>

              {/* Search bar — big & prominent */}
              <div className="relative max-w-lg">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Tìm khoá học bạn muốn học..."
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-coral-500/60 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Platform stats */}
              <div className="flex items-center gap-5 mt-5">
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
