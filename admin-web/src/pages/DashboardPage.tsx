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
  <div className="card">
    <p className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--color-primary)' }}>
      {value.toLocaleString()}
    </p>
    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-base)' }}>
      {label}
    </p>
    {sub && (
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
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
        <h1 className="page-title mb-2">Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Platform overview and key metrics
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading statistics...</p>
        </div>
      )}

      {stats && (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
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
