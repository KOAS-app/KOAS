import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { User } from '../types';
import { getApiError } from '../utils/apiError';

type RoleFilter = 'ALL' | 'PLAYER' | 'OWNER';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoleFilter>('ALL');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approvingUser, setApprovingUser] = useState<string | null>(null);
  const [blockingUser, setBlockingUser] = useState<string | null>(null);
  const [blockModalUser, setBlockModalUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  
  // Plan Change States
  const [selectedOwnerForPlan, setSelectedOwnerForPlan] = useState<User | null>(null);
  const [modalSelectedPlan, setModalSelectedPlan] = useState<string>('STARTER');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  useEffect(() => {
    api.get('/admin/users')
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(getApiError(err, 'Failed to delete user.'));
    } finally {
      setDeleting(null);
    }
  };

  const handleApproveUser = async (id: string, name: string) => {
    if (!confirm(`Approve owner "${name}"? This will allow them to access the platform.`)) return;
    setApprovingUser(id);
    try {
      await api.patch(`/admin/users/${id}/approve`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u))
      );
    } catch (err) {
      alert(getApiError(err, 'Failed to approve user.'));
    } finally {
      setApprovingUser(null);
    }
  };

  const handleBlockUser = async (id: string, _name: string) => {
    if (!blockReason.trim()) {
      alert('Please provide a reason for blocking this user.');
      return;
    }
    
    setBlockingUser(id);
    try {
      await api.patch(`/admin/users/${id}/reject`, { reason: blockReason.trim() });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: false, isBlocked: true, rejectionReason: blockReason.trim(), blockedReason: blockReason.trim() } : u))
      );
      setBlockModalUser(null);
      setBlockReason('');
    } catch (err) {
      alert(getApiError(err, 'Failed to block user.'));
    } finally {
      setBlockingUser(null);
    }
  };

  const handleUnblockUser = async (id: string) => {
    setBlockingUser(id);
    try {
      await api.patch(`/admin/users/${id}/unblock`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: true, isBlocked: false, rejectionReason: null, blockedReason: null } : u))
      );
    } catch (err) {
      alert(getApiError(err, 'Failed to unblock user.'));
    } finally {
      setBlockingUser(null);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedOwnerForPlan) return;
    setUpdatingPlan(true);
    try {
      await api.patch(`/admin/users/${selectedOwnerForPlan.id}/subscription`, {
        subscriptionPlan: modalSelectedPlan,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedOwnerForPlan.id
            ? { ...u, subscriptionPlan: modalSelectedPlan }
            : u
        )
      );
      setSelectedOwnerForPlan(null);
    } catch (err) {
      alert(getApiError(err, 'Failed to update subscription plan.'));
    } finally {
      setUpdatingPlan(false);
    }
  };

  const filtered = users
    .filter((u) => filter === 'ALL' || u.role === filter)
    .filter((u) =>
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const getPlanBadge = (plan?: string) => {
    if (!plan) return null;
    const p = plan.toUpperCase();
    if (p === 'ELITE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-extrabold tracking-wider bg-gradient-to-r from-[#f5f3ff] to-[#edd6ff] text-[#6d28d9] border border-[#d8b4fe] shadow-[0_0_8px_rgba(109,40,217,0.12)]">
          👑 ELITE
        </span>
      );
    }
    if (p === 'PRO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-extrabold tracking-wider bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
          ⚡ PRO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-extrabold tracking-wider bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]">
        🌱 STARTER
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">Users</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Manage player and stadium owner accounts, monitor statuses, and adjust membership plans.
          </p>
        </div>
      </div>

      {/* Search + filter row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          className="px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] focus:bg-white"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <div className="flex gap-1 p-1 rounded-[10px] bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          {(['ALL', 'PLAYER', 'OWNER'] as RoleFilter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-4 py-2 rounded-lg font-bold transition-all ${
                filter === f 
                  ? 'bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm' 
                  : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3.5 py-20">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading users…</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">👥</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No users found</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {search ? 'Try adjusting your search or filter.' : 'No users match your filter.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1.2fr_1.4fr_100px_120px_160px_120px] gap-4 px-5 py-3 text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Subscription Tier</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.map((user, i) => (
            <div key={user.id}
              className="flex flex-col sm:grid sm:grid-cols-[1.2fr_1.4fr_100px_120px_160px_120px] items-stretch sm:items-center px-5 py-4 sm:py-3.5 gap-3.5 sm:gap-4 transition-all hover:bg-[var(--color-surface-muted)]"
              style={{
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
              
              {/* Mobile top row: Avatar + Name + Join Date & Role badge */}
              <div className="flex items-start justify-between gap-3 sm:block min-w-0">
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end sm:hidden">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.6875rem] font-bold tracking-wide border ${
                    user.role === 'ADMIN' 
                      ? 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]' 
                      : user.role === 'OWNER'
                        ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]'
                        : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                  }`}>
                    {user.role}
                  </span>
                  {user.role === 'OWNER' && (
                    <div 
                      onClick={() => {
                        setSelectedOwnerForPlan(user);
                        setModalSelectedPlan(user.subscriptionPlan || 'STARTER');
                      }}
                      className="inline-flex mt-1 items-center gap-1 cursor-pointer scale-95 origin-right"
                    >
                      {getPlanBadge(user.subscriptionPlan)}
                    </div>
                  )}
                </div>
              </div>

              {/* Email (Full width on mobile, inline on sm) */}
              <p className="text-sm truncate text-[var(--color-text-muted)] font-medium min-w-0">
                {user.email}
              </p>

              {/* Role badge (Desktop only) */}
              <span className={`hidden sm:inline-flex items-center w-fit px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border flex-shrink-0 ${
                user.role === 'ADMIN' 
                  ? 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]' 
                  : user.role === 'OWNER'
                    ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}>
                {user.role}
              </span>

              {/* Approval Status (Desktop only) */}
              <div className="hidden sm:block">
                {user.isBlocked ? (
                  <span className="inline-flex items-center w-fit px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border bg-[#fef2f2] text-[#dc2626] border-[#fecaca]">
                    ✕ Blocked
                  </span>
                ) : user.role === 'OWNER' && !user.isApproved ? (
                  <span className="inline-flex items-center w-fit px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border bg-[#fef2f2] text-[#dc2626] border-[#fecaca]">
                    ⏳ Pending
                  </span>
                ) : user.role === 'OWNER' && user.isApproved ? (
                  <span className="inline-flex items-center w-fit px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border bg-[#dcfce7] text-[#166534] border-[#bbf7d0]">
                    ✓ Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center w-fit px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border bg-[#dcfce7] text-[#166534] border-[#bbf7d0]">
                    ✓ Active
                  </span>
                )}
              </div>

              {/* Subscription Plan (Desktop only) */}
              <div className="hidden sm:block">
                {user.role === 'OWNER' ? (
                  <div 
                    onClick={() => {
                      setSelectedOwnerForPlan(user);
                      setModalSelectedPlan(user.subscriptionPlan || 'STARTER');
                    }}
                    className="group inline-flex items-center gap-2 cursor-pointer hover:translate-x-0.5 transition-transform"
                    title="Edit Subscription Plan"
                  >
                    {getPlanBadge(user.subscriptionPlan)}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-0 group-hover:opacity-70 text-[var(--color-text-muted)] transition-opacity">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                    </svg>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">—</span>
                )}
              </div>

              {/* Delete action (Self aligned or right aligned) */}
              <div className="flex justify-end sm:justify-end gap-2">
                {user.role === 'OWNER' && !user.isBlocked && (
                  user.isApproved ? (
                    <button
                      className="px-3 py-1.5 text-xs font-bold text-[var(--color-danger)] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      onClick={() => {
                        setBlockModalUser(user);
                        setBlockReason('');
                      }}
                      title="Block user">
                      ✕ Block
                    </button>
                  ) : (
                    <>
                      <button
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary)] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        disabled={approvingUser === user.id}
                        onClick={() => handleApproveUser(user.id, user.name)}
                        title="Approve owner">
                        {approvingUser === user.id ? (
                          <div className="inline-block w-3 h-3 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                        ) : '✓ Approve'}
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-bold text-[var(--color-danger)] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        onClick={() => {
                          setBlockModalUser(user);
                          setBlockReason('');
                        }}
                        title="Block user">
                        ✕ Block
                      </button>
                    </>
                  )
                )}
                {user.isBlocked && (
                  <button
                    className="px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-bg)] border border-[var(--color-primary)] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    disabled={blockingUser === user.id}
                    onClick={() => handleUnblockUser(user.id)}
                    title="Unblock user">
                    {blockingUser === user.id ? (
                      <div className="inline-block w-3 h-3 border-[1.5px] border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : '✓ Unblock'}
                  </button>
                )}
                {user.role === 'PLAYER' && !user.isBlocked && (
                  <button
                    className="px-3 py-1.5 text-xs font-bold text-[var(--color-danger)] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    onClick={() => {
                      setBlockModalUser(user);
                      setBlockReason('');
                    }}
                    title="Block user">
                    ✕ Block
                  </button>
                )}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleting === user.id}
                  onClick={() => handleDelete(user.id, user.name)}
                  title="Delete user">
                  {deleting === user.id ? (
                    <div className="inline-block w-3 h-3 border-[1.5px] border-[var(--color-danger)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Management Dialog Modal */}
      {selectedOwnerForPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOwnerForPlan(null); }}
        >
          <div className="w-full max-w-md bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-base)]">Modify Subscription Plan</h2>
                <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
                  Update plan tier limits for {selectedOwnerForPlan.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedOwnerForPlan(null)}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl p-3.5 text-xs text-[var(--color-text-secondary)] flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Current Plan:</span>
                  <span className="font-extrabold text-[var(--color-text-base)]">{selectedOwnerForPlan.subscriptionPlan || 'STARTER'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span className="font-medium truncate max-w-[200px]">{selectedOwnerForPlan.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] mb-2.5">
                  Select Pricing Plan Tier
                </label>
                <div className="flex flex-col gap-2.5">
                  {/* STARTER */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      modalSelectedPlan === 'STARTER'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                        : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="planRadio"
                        value="STARTER"
                        checked={modalSelectedPlan === 'STARTER'}
                        onChange={() => setModalSelectedPlan('STARTER')}
                        className="w-4 h-4 text-[var(--color-primary)]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-base)]">🌱 Kickoff Starter</p>
                        <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-0.5">1 Turf, 1 Bank Account, 1 Plan Template</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">1,000 ETB</span>
                  </label>

                  {/* PRO */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      modalSelectedPlan === 'PRO'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                        : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="planRadio"
                        value="PRO"
                        checked={modalSelectedPlan === 'PRO'}
                        onChange={() => setModalSelectedPlan('PRO')}
                        className="w-4 h-4 text-[var(--color-primary)]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-base)]">⚡ Pro Turf Master</p>
                        <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-0.5">3 Turfs, Auto Scheduling, 3 Accounts</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">2,500 ETB</span>
                  </label>

                  {/* ELITE */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      modalSelectedPlan === 'ELITE'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                        : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="planRadio"
                        value="ELITE"
                        checked={modalSelectedPlan === 'ELITE'}
                        onChange={() => setModalSelectedPlan('ELITE')}
                        className="w-4 h-4 text-[var(--color-primary)]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-base)]">👑 Elite Arena Complex</p>
                        <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-0.5">Unlimited Turfs, AI Metrics, 10 Plan Templates</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">5,000 ETB</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <button
                type="button"
                onClick={() => setSelectedOwnerForPlan(null)}
                className="w-full py-2.5 rounded-[10px] text-sm font-bold text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePlan}
                disabled={updatingPlan}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-sm font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingPlan ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Save Plan Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Reason Modal */}
      {blockModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setBlockModalUser(null); }}
        >
          <div className="w-full max-w-md bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-base)]">
                  Block User
                </h2>
                <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
                  Provide a reason for blocking {blockModalUser.name}
                </p>
              </div>
              <button
                onClick={() => setBlockModalUser(null)}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] mb-2.5">
                Block Reason
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)] focus:bg-white resize-y min-h-[100px]"
                placeholder="e.g., Violation of terms of service..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                maxLength={500}
                autoFocus
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                This message will be shown to the user.
              </p>
            </div>

            <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <button
                type="button"
                onClick={() => setBlockModalUser(null)}
                className="w-full py-2.5 rounded-[10px] text-sm font-bold text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] transition-all"
                disabled={blockingUser === blockModalUser.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBlockUser(blockModalUser.id, blockModalUser.name)}
                disabled={blockingUser === blockModalUser.id || !blockReason.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-sm font-bold text-white bg-[var(--color-danger)] border border-[var(--color-danger)] transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {blockingUser === blockModalUser.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Blocking...
                  </>
                ) : (
                  '✕ Block User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
