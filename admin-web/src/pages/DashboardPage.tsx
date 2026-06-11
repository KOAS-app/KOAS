import { useEffect, useState } from 'react';
import api from '../api/axios';


interface Stats {
  totalUsers: number;
  totalOwners: number;
  totalPlayers: number;
  totalStadiums: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  starterPlans: number;
  proPlans: number;
  elitePlans: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, stadiumsRes, bookingsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stadiums'),
        api.get('/admin/bookings'),
      ]);

      const users = usersRes.data as any[];
      const stadiums = stadiumsRes.data as any[];
      const bookings = bookingsRes.data as any[];

      const owners = users.filter((u) => u.role === 'OWNER');
      const players = users.filter((u) => u.role === 'PLAYER');

      const starterCount = owners.filter((o) => (o.subscriptionPlan || 'STARTER').toUpperCase() === 'STARTER').length;
      const proCount     = owners.filter((o) => o.subscriptionPlan?.toUpperCase() === 'PRO').length;
      const eliteCount   = owners.filter((o) => o.subscriptionPlan?.toUpperCase() === 'ELITE').length;

      setStats({
        totalUsers:        users.length,
        totalOwners:       owners.length,
        totalPlayers:      players.length,
        totalStadiums:     stadiums.length,
        totalBookings:     bookings.length,
        confirmedBookings: bookings.filter((b) => b.status === 'CONFIRMED').length,
        pendingBookings:   bookings.filter((b) => b.status === 'PENDING').length,
        starterPlans:      starterCount,
        proPlans:          proCount,
        elitePlans:        eliteCount,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 py-40">
        <div className="inline-block w-8 h-8 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading KOAS analytics…</span>
      </div>
    );
  }

  const totalActiveOwners = stats ? (stats.starterPlans + stats.proPlans + stats.elitePlans) : 0;
  const starterPercent = totalActiveOwners > 0 && stats ? Math.round((stats.starterPlans / totalActiveOwners) * 100) : 0;
  const proPercent = totalActiveOwners > 0 && stats ? Math.round((stats.proPlans / totalActiveOwners) * 100) : 0;
  const elitePercent = totalActiveOwners > 0 && stats ? Math.round((stats.elitePlans / totalActiveOwners) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Premium Glassmorphic Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-[#10b981]/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] bg-blue-500/20 text-[#60a5fa] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Control Panel
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-3">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Welcome back. You have full system overview of users, bookings, stadium requests, and transaction disputes across the KOAS network.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/[0.04] border border-white/[0.08] px-4.5 py-3 rounded-xl">
            <span className="text-xs text-slate-400 font-medium block">Local Server Time</span>
            <span className="text-base font-extrabold text-white mt-0.5 block">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Users */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-5.5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-border-strong)] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Platform Users</span>
              <span className="text-3xl font-black text-[var(--color-text-base)] tracking-tight block mt-1">
                {stats.totalUsers.toLocaleString()}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] mt-1.5 block">
                {stats.totalPlayers} Players &nbsp;·&nbsp; {stats.totalOwners} Owners
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>

          {/* Card 2: Stadiums */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-5.5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-border-strong)] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Stadiums</span>
              <span className="text-3xl font-black text-[var(--color-text-base)] tracking-tight block mt-1">
                {stats.totalStadiums.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                ✓ All Registered
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>

          {/* Card 3: Bookings */}
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-5.5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-border-strong)] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Bookings</span>
              <span className="text-3xl font-black text-[var(--color-text-base)] tracking-tight block mt-1">
                {stats.totalBookings.toLocaleString()}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] mt-1.5 block">
                {stats.confirmedBookings} Confirmed &nbsp;·&nbsp; {stats.pendingBookings} Pending
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>

        </div>
      )}

      {/* Platform Subscription Plan Tier Distribution */}
      {stats && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-[var(--color-text-base)] tracking-tight mb-1.5 flex items-center gap-2">
            🏟️ Owner Subscription Plan Tiers
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-6">
            Platform subscription metrics showing registered owner tiers (STARTER, PRO, ELITE).
          </p>

          <div className="flex flex-col gap-6">
            {/* Visual Bar Breakdown Chart */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${starterPercent}%` }} title={`Starter: ${starterPercent}%`} />
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${proPercent}%` }} title={`Pro: ${proPercent}%`} />
              <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${elitePercent}%` }} title={`Elite: ${elitePercent}%`} />
            </div>

            {/* Tiers Legend Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* STARTER */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#f8fafc] flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    🌱 Kickoff Starter
                  </span>
                  <p className="text-2xl font-black text-[var(--color-text-base)] tracking-tight mt-2.5">
                    {stats.starterPlans} <span className="text-xs font-medium text-[var(--color-text-muted)]">Owners</span>
                  </p>
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-2.5 pt-2 border-t border-[var(--color-border)]">
                  {starterPercent}% of owners &nbsp;·&nbsp; 1,000 ETB/mo
                </div>
              </div>

              {/* PRO */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-[#f0fdf4] flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    ⚡ Pro Turf Master
                  </span>
                  <p className="text-2xl font-black text-emerald-800 tracking-tight mt-2.5">
                    {stats.proPlans} <span className="text-xs font-medium text-emerald-600">Owners</span>
                  </p>
                </div>
                <div className="text-[11px] text-emerald-600 mt-2.5 pt-2 border-t border-emerald-100">
                  {proPercent}% of owners &nbsp;·&nbsp; 2,500 ETB/mo
                </div>
              </div>

              {/* ELITE */}
              <div className="p-4 rounded-xl border border-violet-100 bg-[#f5f3ff] flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
                    👑 Elite Arena Complex
                  </span>
                  <p className="text-2xl font-black text-violet-800 tracking-tight mt-2.5">
                    {stats.elitePlans} <span className="text-xs font-medium text-violet-600">Owners</span>
                  </p>
                </div>
                <div className="text-[11px] text-violet-600 mt-2.5 pt-2 border-t border-violet-100">
                  {elitePercent}% of owners &nbsp;·&nbsp; 5,000 ETB/mo
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
