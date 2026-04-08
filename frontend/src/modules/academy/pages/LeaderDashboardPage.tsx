import { useQuery } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import ProgressBar from '../components/ProgressBar';
import type { TeamProgressSummary } from '../types/academy.types';
import { API_PREFIX } from '../constants/academy.constants';

async function fetchTeamProgress(): Promise<TeamProgressSummary[]> {
  const res = await fetch(`${API_PREFIX}/leader/team-progress`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

export default function LeaderDashboardPage() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['academy-team-progress'],
    queryFn: fetchTeamProgress,
  });

  const totalActive = teams?.reduce((s, t) => s + t.active_learners, 0) ?? 0;
  const avgCompletion = teams?.length
    ? teams.reduce((s, t) => s + t.avg_completion_pct, 0) / teams.length
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar role="leader" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 max-w-5xl">
          <h1 className="text-xl font-bold text-white mb-5">Dashboard Leader</h1>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { icon: '👥', value: `${totalActive}`, label: 'Learner active 7 ngày' },
              { icon: '📈', value: `${Math.round(avgCompletion)}%`, label: 'Avg completion' },
              { icon: '📊', value: '–', label: 'Events tuần này' },
              { icon: '🏆', value: '–', label: 'Certs tháng này' },
            ].map(k => (
              <div key={k.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl mb-1">{k.icon}</div>
                <div className="text-xl font-bold text-white">{k.value}</div>
                <div className="text-xs text-gray-400">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Team cards */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="bg-white/5 rounded-xl h-32 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {teams?.map(team => (
                <div key={team.team_id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{team.team_name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {team.member_count} thành viên · {team.active_learners} active
                      </p>
                    </div>
                    <span className="text-sm font-bold text-teal-400">{Math.round(team.avg_completion_pct)}%</span>
                  </div>
                  <ProgressBar value={team.avg_completion_pct} color="teal" height="sm" />
                  {team.top_courses.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Top khoá học</p>
                      {team.top_courses.slice(0, 3).map(c => (
                        <p key={c.course_title} className="text-xs text-gray-300">• {c.course_title}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
