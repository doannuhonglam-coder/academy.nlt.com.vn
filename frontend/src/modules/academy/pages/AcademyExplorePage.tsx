import { useState, useRef } from 'react';
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


export default function AcademyExplorePage() {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('all');
  const [offlineOnly, setOffline] = useState(false);
  const [searchInput, setInput]   = useState('');
  const [tierExpanded, setTierExpanded] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);

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

          {/* ── Hero Banner — compact ─────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-b border-white/5 px-4 md:px-8 pt-5 pb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 via-transparent to-teal-500/5 pointer-events-none" />

            <div className="relative">
              {/* Slogan + search — always visible */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-lg md:text-2xl font-extrabold text-white leading-tight">
                    Kỹ năng thật.{' '}
                    <span className="bg-gradient-to-r from-coral-400 to-gold-400 bg-clip-text text-transparent">Dự án thật.</span>
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">Học xong là làm được — không lý thuyết suông.</p>
                </div>
                {/* Stats mini */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-white">12k+</p>
                  <p className="text-[9px] text-gray-500">học viên</p>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative mb-3">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Tìm khoá học bạn muốn học..."
                  className="w-full bg-white/8 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-coral-500/60 focus:bg-white/10 transition-all"
                />
              </div>

              {/* ── Tier strip — collapsible ── */}
              <button
                onClick={() => setTierExpanded(v => !v)}
                className="w-full flex items-center justify-between bg-white/3 border border-white/8 rounded-xl px-3 py-2 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌱</span>
                  <span className="text-xs text-gray-300 font-medium">Volunteer</span>
                  <span className="text-gray-600 text-xs">→</span>
                  <span className="text-xs text-gray-500">💼</span>
                  <span className="text-gray-600 text-xs">→</span>
                  <span className="text-xs text-gray-500">⭐</span>
                  <span className="text-gray-600 text-xs">→</span>
                  <span className="text-xs text-gray-500">🏆</span>
                  <span className="text-[10px] text-teal-400 font-bold ml-1 bg-teal-500/10 border border-teal-500/15 px-1.5 py-0.5 rounded-full">Bạn ở đây</span>
                </div>
                <span className="text-gray-500 text-xs">{tierExpanded ? '▲' : '▼'}</span>
              </button>

              {/* Expanded tier detail */}
              {tierExpanded && (
                <div className="mt-2 bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
                  {[
                    { icon: '🌱', label: 'Volunteer',    active: true,  desc: 'Học & tích Nhile Credit — đổi quà, unlock video' },
                    { icon: '💼', label: 'Work & Learn', active: false, desc: 'Làm dự án thực chiến — dành cho member kỷ luật tốt' },
                    { icon: '⭐', label: 'Nhile Star',   active: false, desc: 'Được dẫn dắt bởi founder & leader từ doanh nghiệp thực chiến' },
                    { icon: '🏆', label: 'Certificate',  active: false, desc: 'Hoàn thành hành trình — nhận giấy chứng nhận NLT' },
                  ].map((t, i) => (
                    <div key={i} className={`flex gap-3 items-start ${t.active ? '' : 'opacity-50'}`}>
                      <span className="text-base flex-shrink-0 mt-0.5">{t.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${t.active ? 'text-teal-300' : 'text-gray-400'}`}>{t.label}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Category Pills (horizontal scroll) ──────── */}
          <div className="relative py-3 border-b border-white/5">
            {/* Fade hint on right — signals scrollability to low-tech users */}
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none z-10 md:hidden" />
            <div className="overflow-x-auto px-4 md:px-8 scrollbar-none" ref={pillsRef}>
            <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap pr-8 md:pr-0">
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
