import { useEffect, useState } from 'react';
import api from '../api/axios';
import { User } from '../types';
import { getApiError } from '../utils/apiError';

type RoleFilter = 'ALL' | 'PLAYER' | 'OWNER' | 'ADMIN';

const roleStyle: Record<string, string> = {
  PLAYER: 'badge-muted',
  OWNER:  'badge-success',
  ADMIN:  'badge-warning',
};

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
      <h1 className="page-title">Users</h1>

      {/* Search + filter row */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          className="input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div className="flex gap-1 p-1 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface-muted)' }}>
          {(['ALL', 'PLAYER', 'OWNER', 'ADMIN'] as RoleFilter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
              style={{
                backgroundColor: filter === f ? 'var(--color-surface-card)' : 'transparent',
                color: filter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: filter === f ? 'var(--shadow-card)' : 'none',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>}

      {!loading && filtered.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">👥</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No users found</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card p-0 overflow-hidden">
          {/* Table header */}
          <div className="grid px-5 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: '1fr 1fr auto auto',
              color: 'var(--color-text-muted)',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-muted)',
            }}>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span></span>
          </div>

          {filtered.map((user, i) => (
            <div key={user.id}
              className="grid items-center px-5 py-3 gap-4"
              style={{
                gridTemplateColumns: '1fr 1fr auto auto',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-base)' }}>
                  {user.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                {user.email}
              </p>
              <span className={`badge ${roleStyle[user.role]}`}>{user.role}</span>
              <button
                className="btn btn-danger text-xs"
                disabled={deleting === user.id}
                onClick={() => handleDelete(user.id, user.name)}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
