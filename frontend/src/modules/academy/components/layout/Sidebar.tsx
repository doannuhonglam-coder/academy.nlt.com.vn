import { NavLink } from 'react-router-dom';

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const isLeader = role && ['leader', 'co-leader', 'admin', 'owner'].includes(role);
  const isAdmin = role && ['admin', 'owner'].includes(role);

  const navItem = (to: string, icon: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-coral-500/20 text-coral-400'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      {label}
    </NavLink>
  );

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col gap-1 py-4 px-3 border-r border-white/5 min-h-screen">
      {/* Brand */}
      <div className="px-4 py-3 mb-4">
        <span className="font-brand text-xl font-bold bg-gradient-to-r from-coral-400 via-gold-400 to-teal-400 bg-clip-text text-transparent">
          Academy.nlt
        </span>
      </div>

      {navItem('/training', '🏠', 'Trang chủ')}
      {navItem('/academy', '📚', 'Khám phá')}
      {navItem('/training/profile', '🏆', 'Chứng chỉ')}
      {navItem('/training/profile', '👤', 'Hồ sơ')}
      {isLeader && navItem('/training/dashboard', '📊', 'Dashboard Leader')}
      {isAdmin && navItem('/training/ndata', '🗄️', 'N-Data')}
    </aside>
  );
}
