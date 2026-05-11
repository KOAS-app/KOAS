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
    <p className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>{value}</p>
    <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-base)' }}>{label}</p>
    {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
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
      <h1 className="page-title">Dashboard</h1>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>}

      {stats && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          <StatCard label="Total Users"      value={stats.totalUsers} />
          <StatCard label="Total Stadiums"   value={stats.totalStadiums}   sub={`${stats.pendingStadiums} pending approval`} />
          <StatCard label="Total Bookings"   value={stats.totalBookings}   sub={`${stats.pendingBookings} pending`} />
          <StatCard label="Confirmed"        value={stats.confirmedBookings} />
        </div>
      )}
    </div>
  );
}
