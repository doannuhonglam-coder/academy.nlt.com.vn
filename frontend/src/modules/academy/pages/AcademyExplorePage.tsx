import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
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
  { id: 'all', label: 'Tất cả' },
  { id: 'tu-duy', label: 'Tư duy' },
  { id: 'tai-chinh', label: 'Tài chính' },
  { id: 'giao-tiep', label: 'Giao tiếp' },
  { id: 'lanh-dao', label: 'Lãnh đạo' },
  { id: 'ki-nang-mem', label: 'Kỹ năng mềm' },
];

export default function AcademyExplorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [offlineOnly, setOfflineOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['academy-courses', search, category],
    queryFn: () => fetchCourses(search, category),
    staleTime: STALE_TIME.COURSES,
  });

  const courses = (data?.data ?? []).filter(c => !offlineOnly || c.is_offline_available);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar showSearch onSearch={setSearch} />

        <div className="flex flex-1">
          {/* Sidebar filters */}
          <aside className="w-52 flex-shrink-0 p-4 border-r border-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Danh mục</p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat.id
                      ? 'bg-coral-500/20 text-coral-400 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offlineOnly}
                  onChange={e => setOfflineOnly(e.target.checked)}
                  className="rounded"
                />
                Có offline
              </label>
            </div>
          </aside>

          {/* Main grid */}
          <main className="flex-1 p-6">
            <h1 className="text-xl font-bold text-white mb-6">
              {search ? `Kết quả cho "${search}"` : 'Khám phá khoá học'}
            </h1>

            {isLoading ? (
              /* Skeleton */
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <span className="text-4xl mb-4">🔍</span>
                <p className="text-sm">Không tìm thấy khoá học phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
