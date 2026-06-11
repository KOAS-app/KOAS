import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import officialLogo from '../assets/logo/koas_official_logo.png';

// Navigation structure with proper icons and grouping
const navSections = [
  {
    label: 'Overview',
    items: [
      { 
        to: '/dashboard', 
        label: 'Dashboard',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        )
      },
    ]
  },
  {
    label: 'Management',
    items: [
      { 
        to: '/stadiums', 
        label: 'Stadiums',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        )
      },
      { 
        to: '/users', 
        label: 'Users',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      },
      { 
        to: '/bookings', 
        label: 'Bookings',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        )
      },
      { 
        to: '/reviews', 
        label: 'Reviews',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
      },
    ]
  }
];

/* ─── Breadcrumb map ─────────────────────────────────────────── */
function useBreadcrumb() {
  const { pathname } = useLocation();
  if (pathname.includes('/dashboard')) return ['Dashboard'];
  if (pathname.includes('/stadiums')) return ['Stadiums'];
  if (pathname.includes('/users')) return ['Users'];
  if (pathname.includes('/bookings')) return ['Bookings'];
  if (pathname.includes('/reviews')) return ['Reviews'];
  return [];
}


export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwModal, setPwModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const breadcrumbs = useBreadcrumb();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 md:relative flex-shrink-0 flex flex-col bg-gradient-to-b from-[#0f1729] to-[#1e293b] border-r border-[rgba(59,130,246,.1)] transition-all duration-[220ms] ease-[cubic-bezier(.4,0,.2,1)] overflow-hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: sidebarExpanded ? '240px' : '64px' }}
      >

        {/* Brand */}
        <div 
          className={`flex items-center flex-shrink-0 border-b border-white/[0.04] ${
            sidebarExpanded 
              ? 'justify-between px-5 pt-[1.375rem] pb-[1.125rem]' 
              : 'justify-center pt-[1.375rem] pb-[1.125rem]'
          }`}
        >
          {sidebarExpanded ? (
            <div className="flex items-center gap-2">
              <LogoMark />
              <div>
                <p className="text-[1.125rem] font-black tracking-[-0.04em] text-white leading-none">
                  KO<span className="text-[#60a5fa]">A</span>S
                </p>
                <p className="text-[0.5625rem] font-extrabold text-[rgba(96,165,250,.7)] uppercase tracking-[0.1em] mt-px">
                  Admin Portal
                </p>
              </div>
            </div>
          ) : (
            <LogoMark />
          )}

          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={() => setSidebarExpanded(p => !p)}
            className="hidden md:flex w-[26px] h-[26px] rounded-md bg-white/[0.04] border border-white/[0.08] items-center justify-center flex-shrink-0 text-white/40 transition-all duration-150 hover:text-white hover:bg-white/[0.08]"
            title={sidebarExpanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-transform duration-[220ms]"
              style={{ transform: sidebarExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          {/* Close toggle (Mobile only) */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden w-[26px] h-[26px] rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/40 transition-all duration-150 hover:text-white hover:bg-white/[0.08]"
            title="Close Menu"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3.5 px-2.5 overflow-hidden">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              {sidebarExpanded && (
                <p className="text-[0.5625rem] font-extrabold text-white/25 uppercase tracking-[0.1em] px-2.5 pb-2">
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    title={!sidebarExpanded ? label : undefined}
                    className={({ isActive }) => 
                      `flex items-center gap-2.5 rounded-lg transition-all duration-150 ${
                        sidebarExpanded ? 'px-3 py-[0.5625rem]' : 'justify-center py-[0.5625rem]'
                      } ${
                        isActive 
                          ? 'bg-[rgba(59,130,246,.15)] border border-[rgba(59,130,246,.25)] text-[#60a5fa] shadow-[0_0_12px_rgba(59,130,246,.15)]' 
                          : 'border border-transparent text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex-shrink-0">{icon}</span>
                    {sidebarExpanded && <span className="text-[0.8125rem] font-semibold tracking-tight">{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="py-3.5 px-2.5 pb-5 border-t border-white/[0.04] flex-shrink-0">

          {/* User card */}
          {sidebarExpanded ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <UserAvatar initials={initials} />
              <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-bold text-white/90 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user?.name}
                </p>
                <p className="text-[0.6875rem] text-white/35 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2" title={user?.name}>
              <UserAvatar initials={initials} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-0.5">
            <SidebarAction
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              label="Change Password"
              onClick={() => setPwModal(true)}
              expanded={sidebarExpanded}
              title="Change Password"
            />
            <SidebarAction
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
              label="Log Out"
              onClick={handleLogout}
              expanded={sidebarExpanded}
              danger
              title="Log Out"
            />
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Top bar */}
        <header className="h-[52px] flex-shrink-0 flex items-center px-4 md:px-10 bg-[rgba(248,250,252,.9)] backdrop-blur-[8px] border-b border-[var(--color-border)]">
          {/* Hamburger (Mobile) */}
          <button 
            className="md:hidden mr-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-base)]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 flex-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-border-strong)]">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
                <span 
                  className={`text-[0.8125rem] tracking-[-0.01em] ${
                    i === breadcrumbs.length - 1 
                      ? 'font-bold text-[var(--color-text-base)]' 
                      : 'font-medium text-[var(--color-text-muted)]'
                  }`}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-10 md:py-10 pb-16">
            <Outlet />
          </div>
        </main>
      </div>

      {pwModal && <ChangePasswordModal onClose={() => setPwModal(false)} />}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */
function LogoMark() {
  return (
    <img 
      src={officialLogo} 
      alt="KOAS Logo" 
      className="w-10 h-10 object-contain flex-shrink-0" 
    />
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] flex items-center justify-center text-xs font-extrabold text-white">
      {initials}
    </div>
  );
}

function SidebarAction({ icon, label, onClick, expanded, danger, title }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  expanded: boolean; danger?: boolean; title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const dangerHover = danger && hovered;
  return (
    <button
      onClick={onClick}
      title={!expanded ? title : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center w-full text-left rounded-lg border transition-all duration-150 text-[0.8125rem] font-semibold ${
        expanded ? 'gap-2 px-3 py-[0.4375rem]' : 'justify-center py-2'
      } ${
        dangerHover 
          ? 'border-[rgba(239,68,68,.2)] bg-[rgba(239,68,68,.08)] text-[#fca5a5]' 
          : hovered 
            ? 'border-white/[0.06] bg-white/[0.05] text-white/90' 
            : 'border-white/[0.06] bg-transparent text-white/45'
      }`}
    >
      <span className="flex-shrink-0 flex items-center">{icon}</span>
      {expanded && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
