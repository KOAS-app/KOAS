import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

/* ─── Nav config ────────────────────────────────────────────── */
const NAV = [
  {
    to: '/stadiums',
    label: 'Stadiums',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

/* ─── Breadcrumb map ─────────────────────────────────────────── */
function useBreadcrumb() {
  const { pathname } = useLocation();
  if (pathname.includes('/bookings')) return ['Stadiums', 'Bookings'];
  if (pathname.includes('/slots')) return ['Stadiums', 'Slots'];
  if (pathname.includes('/stadiums')) return ['Stadiums'];
  return [];
}

/* ─── Layout ─────────────────────────────────────────────────── */
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwModal, setPwModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const breadcrumbs = useBreadcrumb();

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-surface)' }}>

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: sidebarExpanded ? '240px' : '64px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0c1a12 0%, #0f1e15 100%)',
        borderRight: '1px solid rgba(22,163,74,.1)',
        transition: 'width 220ms cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20,
      }}>

        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: sidebarExpanded ? '1.375rem 1.25rem 1.125rem' : '1.375rem 0 1.125rem',
          justifyContent: sidebarExpanded ? 'space-between' : 'center',
          borderBottom: '1px solid rgba(255,255,255,.04)',
          flexShrink: 0,
        }}>
          {sidebarExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogoMark />
              <div>
                <p style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1 }}>
                  KO<span style={{ color: '#4ade80' }}>A</span>S
                </p>
                <p style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'rgba(74,222,128,.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1px' }}>
                  Owner Portal
                </p>
              </div>
            </div>
          ) : (
            <LogoMark />
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarExpanded(p => !p)}
            style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              cursor: 'pointer', color: 'rgba(255,255,255,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; (e.currentTarget as HTMLElement).style.background = ''; }}
            title={sidebarExpanded ? 'Collapse' : 'Expand'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: sidebarExpanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 220ms' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.875rem 0.625rem', overflow: 'hidden' }}>
          {sidebarExpanded && (
            <p style={{ fontSize: '0.5625rem', fontWeight: 800, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.625rem 0.5rem' }}>
              Management
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                title={!sidebarExpanded ? label : undefined}
                className={({ isActive }) => `sidebar-item${isActive ? ' sidebar-item-active' : ''}`}
                style={{
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  padding: sidebarExpanded ? '0.5625rem 0.75rem' : '0.5625rem',
                  borderRadius: '8px',
                }}
              >
                <span className="sidebar-item-icon" style={{ flexShrink: 0 }}>{icon}</span>
                {sidebarExpanded && <span className="sidebar-item-label">{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: '0.875rem 0.625rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.04)', flexShrink: 0 }}>

          {/* User card */}
          {sidebarExpanded ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.625rem 0.75rem', marginBottom: '0.5rem',
              background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: '8px',
            }}>
              <UserAvatar initials={initials} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }} title={user?.name}>
              <UserAvatar initials={initials} />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          height: '52px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2.5rem',
          background: 'rgba(248,250,252,.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-border-strong)' }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: i === breadcrumbs.length - 1 ? 700 : 500,
                  color: i === breadcrumbs.length - 1 ? 'var(--color-text-base)' : 'var(--color-text-muted)',
                  letterSpacing: '-0.01em',
                }}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.25rem 0.625rem', borderRadius: '99px',
            background: 'var(--color-primary-bg)', border: '1px solid #bbf7d0',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--color-primary)',
              boxShadow: '0 0 5px var(--color-primary)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>
              LIVE
            </span>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2.5rem 4rem' }}>
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
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(22,163,74,.35)',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.75rem', fontWeight: 800, color: '#fff',
    }}>
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
      style={{
        display: 'flex', alignItems: 'center',
        gap: expanded ? '0.5rem' : 0,
        justifyContent: expanded ? 'flex-start' : 'center',
        padding: expanded ? '0.4375rem 0.75rem' : '0.5rem',
        borderRadius: '8px', width: '100%', cursor: 'pointer', textAlign: 'left',
        border: '1px solid',
        transition: 'all 150ms',
        borderColor: dangerHover ? 'rgba(220,38,38,.2)' : 'rgba(255,255,255,.06)',
        background: dangerHover ? 'rgba(220,38,38,.08)' : hovered ? 'rgba(255,255,255,.05)' : 'transparent',
        color: dangerHover ? '#fca5a5' : hovered ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.45)',
        fontSize: '0.8125rem', fontWeight: 600,
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {expanded && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </button>
  );
}
