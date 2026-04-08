import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Topbar from '../../components/layout/Topbar';
import Sidebar from '../../components/layout/Sidebar';
import type { ContentType, ProficiencyLevel } from '../../types/academy.types';
import { API_PREFIX } from '../../constants/academy.constants';

interface CreateCourseForm {
  slug: string;
  title: string;
  description: string;
  content_type: ContentType;
  proficiency_level: ProficiencyLevel;
  estimated_minutes: number;
}

const defaultForm: CreateCourseForm = {
  slug: '',
  title: '',
  description: '',
  content_type: 'community',
  proficiency_level: 'L1',
  estimated_minutes: 0,
};

async function createCourse(form: CreateCourseForm) {
  const res = await fetch(`${API_PREFIX}/cms/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer mock-token` },
    body: JSON.stringify(form),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Lỗi tạo khoá học');
  }
  return res.json();
}

export default function CmsCoursesPage() {
  const [form, setForm] = useState<CreateCourseForm>(defaultForm);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      setSuccess(true);
      setForm(defaultForm);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const set = (field: keyof CreateCourseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-coral-500/50 transition-colors';
  const labelCls = 'block text-xs font-medium text-gray-400 mb-1';

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 max-w-2xl">
          <h1 className="text-xl font-bold text-white mb-1">CMS — Tạo khoá học</h1>
          <p className="text-sm text-gray-400 mb-6">Admin/Owner only</p>

          {success && (
            <div className="mb-4 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm rounded-xl px-4 py-3">
              ✓ Khoá học đã được tạo thành công!
            </div>
          )}

          {mutation.isError && (
            <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
              ✗ {mutation.error?.message}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Slug *</label>
                <input
                  className={inputCls}
                  placeholder="tu-duy-phan-bien"
                  value={form.slug}
                  onChange={set('slug')}
                />
                <p className="text-[10px] text-gray-500 mt-1">Lowercase, dùng dấu -</p>
              </div>
              <div>
                <label className={labelCls}>Tiêu đề *</label>
                <input
                  className={inputCls}
                  placeholder="Tư Duy Phản Biện"
                  value={form.title}
                  onChange={set('title')}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea
                className={`${inputCls} resize-none h-20`}
                placeholder="Mô tả ngắn về khoá học..."
                value={form.description}
                onChange={set('description')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Loại nội dung *</label>
                <select className={inputCls} value={form.content_type} onChange={set('content_type')}>
                  <option value="community">Cộng đồng</option>
                  <option value="internal">Nội bộ</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Trình độ *</label>
                <select className={inputCls} value={form.proficiency_level} onChange={set('proficiency_level')}>
                  <option value="L1">L1 — Cơ bản</option>
                  <option value="L2">L2 — Trung cấp</option>
                  <option value="L3">L3 — Nâng cao</option>
                  <option value="L4">L4 — Chuyên gia</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Thời lượng (phút)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="120"
                  value={form.estimated_minutes}
                  onChange={e => setForm(prev => ({ ...prev, estimated_minutes: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending || !form.slug || !form.title}
                className="bg-coral-500 hover:bg-coral-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? 'Đang tạo...' : '+ Tạo khoá học'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
