import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/stadiums',  label: '🏟️ Stadiums'  },
  { to: '/users',     label: '👥 Users'     },
  { to: '/bookings',  label: '📋 Bookings'  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-xl font-black" style={{ color: 'var(--color-accent)' }}>
            KO<span style={{ color: '#fff' }}>A</span>S
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--color-primary)' } : {}
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs truncate mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-left px-3 py-2 rounded text-gray-400 hover:text-white transition-colors"
          >
            → Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
