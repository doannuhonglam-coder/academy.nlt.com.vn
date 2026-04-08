import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  showSearch?: boolean;
  onSearch?: (q: string) => void;
  breadcrumb?: { label: string; to?: string }[];
}

export default function Topbar({ showSearch, onSearch, breadcrumb }: TopbarProps) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setQ(value);
    if (value.length >= 2) onSearch?.(value);
    else if (value.length === 0) onSearch?.('');
  };

  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Logo / Breadcrumb */}
      {breadcrumb ? (
        <nav className="flex items-center gap-2 text-sm text-gray-400 flex-1">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors mr-1">
            ←
          </button>
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-600">›</span>}
              {crumb.to ? (
                <button onClick={() => navigate(crumb.to!)} className="hover:text-white transition-colors">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-white">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : (
        <span className="font-brand text-lg font-bold bg-gradient-to-r from-coral-400 via-gold-400 to-teal-400 bg-clip-text text-transparent flex-shrink-0">
          Academy.nlt
        </span>
      )}

      {showSearch && (
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Tìm khoá học..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-coral-500/50 transition-colors"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button className="text-gray-400 hover:text-white transition-colors text-lg">🔔</button>
        <button
          onClick={() => navigate('/training/profile')}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-gold-500 flex items-center justify-center text-xs font-bold"
        >
          A
        </button>
      </div>
    </header>
  );
}
