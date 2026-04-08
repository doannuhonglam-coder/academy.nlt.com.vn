import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import ProgressBar from '../components/ProgressBar';
import type { GamificationState, MyCertsResponse } from '../types/academy.types';
import { API_PREFIX, STALE_TIME } from '../constants/academy.constants';

async function fetchGamification(): Promise<GamificationState> {
  const res = await fetch(`${API_PREFIX}/me/gamification`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

async function fetchCerts(): Promise<MyCertsResponse> {
  const res = await fetch(`${API_PREFIX}/me/certs`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: gamification } = useQuery({
    queryKey: ['academy-gamification'],
    queryFn: fetchGamification,
    staleTime: STALE_TIME.GAMIFICATION,
  });
  const { data: certs } = useQuery({
    queryKey: ['academy-certs'],
    queryFn: fetchCerts,
    staleTime: STALE_TIME.CERTS,
  });

  const xpPct = gamification
    ? ((gamification.xp_for_next_level_total - gamification.xp_to_next_level) / gamification.xp_for_next_level_total) * 100
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar role="member" />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 max-w-3xl space-y-6">
          {/* Section 1 — Hero Profile */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-gold-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                A
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Nguyễn Văn A</h2>
                  {gamification && (
                    <span className="bg-violet-500/30 text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full">
                      Level {gamification.current_level}
                    </span>
                  )}
                </div>
                {gamification && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>⚡ {gamification.total_xp} XP</span>
                      <span>Còn {gamification.xp_to_next_level} XP lên Level {gamification.current_level + 1}</span>
                    </div>
                    <ProgressBar value={xpPct} color="gold" height="md" />
                  </div>
                )}
              </div>
            </div>

            {gamification && (
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-orange-400">🔥 {gamification.current_streak}</p>
                  <p className="text-xs text-gray-400 mt-1">ngày streak</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gold-400">🏆 {gamification.longest_streak}</p>
                  <p className="text-xs text-gray-400 mt-1">streak dài nhất</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2 — NLT Certs */}
          <div>
            <h2 className="text-base font-bold text-white mb-3">Chứng chỉ NLT</h2>
            {(certs?.earned_certs.length ?? 0) === 0 && (certs?.cert_progress.length ?? 0) === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                <p className="text-sm">Chưa có chứng chỉ nào</p>
                <button
                  onClick={() => navigate('/academy')}
                  className="mt-3 text-sm text-coral-400 hover:underline"
                >
                  Khám phá chương trình học →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {certs?.earned_certs.map(cert => (
                  <div key={cert.id} className="bg-gradient-to-r from-gold-500/10 to-gold-500/5 border border-gold-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{cert.program_title_snapshot}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Cấp ngày {new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-gold-400 bg-gold-500/10 px-2 py-1 rounded">
                        #{cert.verify_code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3 — Badges */}
          {gamification && gamification.badges.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-white mb-3">Huy hiệu</h2>
              <div className="grid grid-cols-4 gap-3">
                {gamification.badges.map(badge => (
                  <div key={badge.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{badge.icon_url ?? '🏅'}</div>
                    <p className="text-xs font-medium text-white">{badge.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {new Date(badge.awarded_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4 — XP History */}
          {gamification && gamification.xp_history.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-white mb-3">Lịch sử XP (7 ngày)</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-end gap-2 h-20">
                  {gamification.xp_history.map((entry, i) => {
                    const max = Math.max(...gamification.xp_history.map(e => e.xp_earned), 1);
                    const pct = (entry.xp_earned / max) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-coral-500/60 rounded-t"
                          style={{ height: `${pct}%`, minHeight: pct > 0 ? '4px' : '0' }}
                        />
                        <span className="text-[9px] text-gray-500">{entry.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
