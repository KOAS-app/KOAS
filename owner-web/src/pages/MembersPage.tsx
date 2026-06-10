import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import type { PlayerSubscription, SubscriptionPlan } from '../types';

export default function MembersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<PlayerSubscription[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, plansRes] = await Promise.all([
        api.get(`/player-subscriptions/owner/members?status=${filter}&search=${search}&planId=${selectedPlan}`),
        api.get('/subscription-plans/my')
      ]);
      setMembers(membersRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load members data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, search, selectedPlan]);

  const getStatusBadge = (status: string, endDate: string) => {
    const isExpired = new Date(endDate) < new Date();
    if (isExpired) {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[rgba(107,114,128,0.1)] text-[#6b7280] border border-[rgba(107,114,128,0.2)]">EXPIRED</span>;
    }
    if (status === 'ACTIVE') {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[rgba(22,163,74,0.1)] text-[#16a34a] border border-[rgba(22,163,74,0.2)]">ACTIVE</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[rgba(234,179,8,0.1)] text-[#eab308] border border-[rgba(234,179,8,0.2)]">{status}</span>;
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const locations = [...new Set(members.map(m => m.subscriptionPlan.location).filter(Boolean) as string[])];

  const filteredMembers = members.filter(m => {
    if (filter === 'active') return m.status === 'ACTIVE' && m.endDate && new Date(m.endDate) >= new Date();
    if (filter === 'expired') return m.endDate && new Date(m.endDate) < new Date();
    return true;
  }).filter(m => selectedLocation === 'all' || m.subscriptionPlan.location === selectedLocation);

  const activeCount = filteredMembers.filter(m => m.status === 'ACTIVE' && m.endDate && new Date(m.endDate) >= new Date()).length;
  const expiredCount = filteredMembers.filter(m => m.endDate && new Date(m.endDate) < new Date()).length;

  if (loading && !members.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-[var(--color-text-muted)] font-medium">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* ─── Top Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="text-[11px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em] mb-1.5">Subscriptions</div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-base)]">Members</h1>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 rounded-xl text-[var(--color-danger)] text-sm font-bold flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}

      {/* ─── Filters ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {(['all', 'active', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                filter === f
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold text-[var(--color-text-secondary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold text-[var(--color-text-secondary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          >
            <option value="all">All Plans</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-base)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] w-full sm:w-64"
          />
        </div>
      </div>

      {/* ─── Stats Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Total Members</span>
            <div className="w-10 h-10 rounded-lg bg-[rgba(22,163,74,0.1)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--color-text-base)]">{members.length}</div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Active</span>
            <div className="w-10 h-10 rounded-lg bg-[rgba(22,163,74,0.1)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-[#16a34a]">{activeCount}</div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Expired</span>
            <div className="w-10 h-10 rounded-lg bg-[rgba(107,114,128,0.1)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-[#6b7280]">{expiredCount}</div>
        </div>
      </div>

      {/* ─── Table Card ────────────────────────────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">End Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                      <p className="text-sm text-[var(--color-text-muted)] font-medium">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-[var(--color-text-secondary)]">No members found</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-[var(--color-text-base)]">{member.player.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{member.player.email}</div>
                        {member.player.phoneNumber && (
                          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{member.player.phoneNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[var(--color-text-base)]">{member.subscriptionPlan.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{member.subscriptionPlan.price} ETB</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(22,163,74,0.1)] border border-[rgba(22,163,74,0.2)] rounded-md">
                        <span className="text-xs font-bold text-[#16a34a]">{member.subscriptionCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        {member.startDate ? new Date(member.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        {member.endDate ? new Date(member.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{getDaysRemaining(member.endDate || '')}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(member.status, member.endDate || '')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
