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

  const filtered = users
    .filter((u) => filter === 'ALL' || u.role === filter)
    .filter((u) =>
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-6">Users</h1>

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
          <div className="hidden sm:grid grid-cols-[1.2fr_1.5fr_120px_40px] gap-4 px-5 py-3 text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span></span>
          </div>

          {filtered.map((user, i) => (
            <div key={user.id}
              className="flex flex-col sm:grid sm:grid-cols-[1.2fr_1.5fr_120px_40px] items-stretch sm:items-center px-5 py-4 sm:py-3.5 gap-3.5 sm:gap-4 transition-all hover:bg-[var(--color-surface-muted)]"
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
                <span className={`sm:hidden inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border flex-shrink-0 ${
                  user.role === 'ADMIN' 
                    ? 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]' 
                    : user.role === 'OWNER'
                      ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]'
                      : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                }`}>
                  {user.role}
                </span>
              </div>

              {/* Email (Full width on mobile, inline on sm) */}
              <p className="text-sm truncate text-[var(--color-text-muted)] font-medium min-w-0">
                {user.email}
              </p>

              {/* Role badge (Desktop only) */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border flex-shrink-0 ${
                user.role === 'ADMIN' 
                  ? 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]' 
                  : user.role === 'OWNER'
                    ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}>
                {user.role}
              </span>

              {/* Delete action (Self aligned or right aligned) */}
              <div className="flex justify-end sm:block">
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
    </div>
  );
}
