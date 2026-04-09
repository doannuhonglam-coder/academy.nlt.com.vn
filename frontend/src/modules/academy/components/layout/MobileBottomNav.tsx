import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/training',         icon: '🏠', label: 'Trang chủ' },
  { to: '/academy',          icon: '📚', label: 'Khám phá'  },
  { to: '/training/profile', icon: '🏆', label: 'Chứng chỉ' },
  { to: '/training/profile', icon: '👤', label: 'Hồ sơ'     },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-950/95 backdrop-blur-md border-t border-white/8 safe-area-pb">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.to === '/training'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-coral-400'
                  : 'text-gray-500 active:text-gray-300'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
