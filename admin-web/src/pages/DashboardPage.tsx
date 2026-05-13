import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Stats {
  totalUsers: number;
  totalStadiums: number;
  pendingStadiums: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
}

const StatCard = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
  <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] p-6 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-border-strong)]">
    <p className="text-[2.25rem] font-black tracking-tight mb-2 leading-none text-[var(--color-primary)]">
      {value.toLocaleString()}
    </p>
    <p className="text-sm font-bold text-[var(--color-text-base)] tracking-tight">
      {label}
    </p>
    {sub && (
      <p className="text-xs mt-1.5 text-[var(--color-text-muted)] font-medium">
        {sub}
      </p>
    )}
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [users, stadiums, bookings] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stadiums'),
          api.get('/admin/bookings'),
        ]);

        const stadiumData = stadiums.data as { isApproved: boolean }[];
        const bookingData = bookings.data as { status: string }[];

        setStats({
          totalUsers:        users.data.length,
          totalStadiums:     stadiumData.length,
          pendingStadiums:   stadiumData.filter((s) => !s.isApproved).length,
          totalBookings:     bookingData.length,
          confirmedBookings: bookingData.filter((b) => b.status === 'CONFIRMED').length,
          pendingBookings:   bookingData.filter((b) => b.status === 'PENDING').length,
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Platform overview and key metrics
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3.5 py-20">
          <div className="inline-block w-[1.625rem] h-[1.625rem] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">
            Loading statistics…
          </span>
        </div>
      )}

      {stats && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard 
            label="Total Stadiums" 
            value={stats.totalStadiums} 
            sub={stats.pendingStadiums > 0 ? `${stats.pendingStadiums} pending approval` : 'All approved'} 
          />
          <StatCard 
            label="Total Bookings" 
            value={stats.totalBookings} 
            sub={stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : 'All processed'} 
          />
          <StatCard label="Confirmed Bookings" value={stats.confirmedBookings} />
        </div>
      )}
    </div>
  );
}
