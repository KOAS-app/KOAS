import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import logoOfficial from '../assets/logo/koas_official_icon.png';
import { isTrialActive, getTrialDaysRemaining } from '../utils/tier';


/* ─── Nav config ────────────────────────────────────────────── */
const NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/slots',
    label: 'Time Slots',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    to: '/bookings',
    label: 'Bookings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/members',
    label: 'Members',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/bank-details',
    label: 'Bank Details',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    to: '/subscription-plans',
    label: 'Subscription Plans',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <path d="M7 11h10M7 15h10M7 7h2" />
      </svg>
    ),
  },
  {
    to: '/subscription-requests',
    label: 'Subscription Request',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    to: '/verify-membership',
    label: 'Verify Member',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  },
  {
    to: '/reviews',
    label: 'Reviews',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

/* ─── Breadcrumb map ─────────────────────────────────────────── */
function useBreadcrumb() {
  const { pathname } = useLocation();
  if (pathname.includes('/dashboard')) return ['Dashboard'];
  if (pathname.includes('/bookings')) return ['Bookings'];
  if (pathname.includes('/members')) return ['Members'];
  if (pathname.includes('/slots')) return ['Time Slots'];
  if (pathname.includes('/reviews')) return ['Reviews'];
  if (pathname.includes('/bank-details')) return ['Bank Details'];
  if (pathname.includes('/subscription-plans')) return ['Subscription Plans'];
  if (pathname.includes('/subscription-requests')) return ['Subscription Requests'];
  if (pathname.includes('/verify-membership')) return ['Verify Membership'];
  return [];
}

/* ─── Layout ─────────────────────────────────────────────────── */
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwModal, setPwModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const breadcrumbs = useBreadcrumb();

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

  const handleLogout = () => { logout(); navigate('/login'); };

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
        className={`fixed inset-y-0 left-0 z-40 md:relative flex-shrink-0 flex flex-col bg-gradient-to-b from-[#0c1a12] to-[#0f1e15] border-r border-[rgba(22,163,74,.1)] transition-all duration-[220ms] ease-[cubic-bezier(.4,0,.2,1)] overflow-hidden ${
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
                  KO<span className="text-[#4ade80]">A</span>S
                </p>
                <p className="text-[0.5625rem] font-extrabold text-[rgba(74,222,128,.7)] uppercase tracking-[0.1em] mt-px">
                  Owner Portal
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

        {/* Nav */}
        <nav className="flex-1 py-3.5 px-2.5 overflow-y-auto">
          {sidebarExpanded && (
            <p className="text-[0.5625rem] font-extrabold text-white/25 uppercase tracking-[0.1em] px-2.5 pb-2">
              Management
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                title={!sidebarExpanded ? label : undefined}
                className={({ isActive }) => 
                  `flex items-center gap-2.5 rounded-lg transition-all duration-150 ${
                    sidebarExpanded ? 'px-3 py-[0.5625rem]' : 'justify-center py-[0.5625rem]'
                  } ${
                    isActive 
                      ? 'bg-[rgba(22,163,74,.15)] border border-[rgba(22,163,74,.25)] text-[#4ade80] shadow-[0_0_12px_rgba(22,163,74,.15)]' 
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

          {/* Back to Homepage Button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[#16a34a] border border-[var(--color-border)] hover:border-[#16a34a]/30 bg-white hover:bg-[#16a34a]/5 rounded-lg transition-all no-underline shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:inline">Back to Homepage</span>
          </Link>

        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {isTrialActive(user) && (
            <div className="bg-gradient-to-r from-[#0c1a12] via-[#0f2d1a] to-[#0c1a12] border-b border-[rgba(74,222,128,0.25)] px-6 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(22,163,74,0.08)] select-none">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
                </span>
                <span className="text-[0.8125rem] font-bold text-white tracking-tight flex items-center gap-1">
                  👑 Elite Free Trial Active:
                  <span className="text-[#4ade80] bg-[rgba(74,222,128,0.1)] px-2 py-0.5 rounded border border-[rgba(74,222,128,0.2)] ml-1 font-extrabold animate-pulse">
                    {getTrialDaysRemaining(user)} {getTrialDaysRemaining(user) === 1 ? 'day' : 'days'} remaining
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <p className="hidden md:block text-[0.75rem] text-white/60">
                  Enjoy auto slot generators and reviews management!
                </p>
                <button
                  onClick={() => navigate('/subscription-plans')}
                  className="px-3 py-1 rounded-[6px] text-[0.75rem] font-black text-white bg-[#16a34a] border border-[#16a34a] transition-all hover:bg-[#15803d] hover:shadow-[0_2px_8px_rgba(22,163,74,0.3)] active:translate-y-0 hover:-translate-y-px"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
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
      src={logoOfficial} 
      alt="KOAS Logo" 
      className="w-16 h-16 object-contain flex-shrink-0" 
    />
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center text-xs font-extrabold text-white">
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
          ? 'border-[rgba(220,38,38,.2)] bg-[rgba(220,38,38,.08)] text-[#fca5a5]' 
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
