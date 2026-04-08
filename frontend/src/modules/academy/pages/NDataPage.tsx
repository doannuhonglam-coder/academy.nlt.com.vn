import { useQuery } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import type { NDataOverview } from '../types/academy.types';
import { API_PREFIX } from '../constants/academy.constants';

async function fetchNDataOverview(): Promise<NDataOverview> {
  const res = await fetch(`${API_PREFIX}/ndata/overview`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

export default function NDataPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['academy-ndata-overview'],
    queryFn: fetchNDataOverview,
  });

  const handleExport = async () => {
    const res = await fetch(`${API_PREFIX}/ndata/events/export`, {
      headers: { Authorization: `Bearer mock-token` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ndata-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-white">N-Data Analytics</h1>
            <button
              onClick={handleExport}
              className="text-sm font-bold px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
            >
              ⬇ Export CSV
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="bg-white/5 rounded-xl h-24 animate-pulse" />)}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Tổng learner', value: data.total_learners },
                  { label: 'Active 7 ngày', value: data.active_learners_7d },
                  { label: 'Tổng events', value: data.total_events.toLocaleString() },
                  { label: 'Events 7 ngày', value: data.events_7d.toLocaleString() },
                ].map(k => (
                  <div key={k.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-2xl font-bold text-white">{k.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Top courses table */}
              <div>
                <h2 className="text-base font-bold text-white mb-3">Top khoá học</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Khoá học</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium">Đăng ký</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium">Hoàn thành</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium">Avg quiz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_courses.map((c, i) => (
                        <tr key={c.course_slug} className={i < data.top_courses.length - 1 ? 'border-b border-white/5' : ''}>
                          <td className="px-4 py-3 text-white">{c.course_title}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.enrollment_count}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{c.completion_count}</td>
                          <td className="px-4 py-3 text-right text-gray-300">
                            {c.avg_quiz_score != null ? `${Math.round(c.avg_quiz_score)}%` : '–'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-gray-500">Dữ liệu cập nhật lúc: {new Date(data.data_as_of).toLocaleString('vi-VN')}</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
