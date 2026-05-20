import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

interface Player {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface SubscriptionRequest {
  id: string;
  playerId: string;
  subscriptionPlanId: string;
  status: string;
  subscriptionCode: string;
  pricePaid: number;
  receiptImageUrl: string | null;
  playerSubmittedAt: string | null;
  player: Player;
  subscriptionPlan: SubscriptionPlan;
}

export default function SubscriptionRequestsPage() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Rejection Modal
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/player-subscriptions/requests');
      setRequests(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to fetch subscription requests.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this membership subscription receipt? This will activate the player\'s membership immediately.')) {
      return;
    }

    try {
      const res = await api.patch(`/player-subscriptions/${id}/confirm`);
      setSuccessMsg(res.data.message || 'Subscription approved and activated successfully.');
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(getApiError(err, 'Failed to approve subscription.'));
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting the receipt.');
      return;
    }

    setSubmittingReject(true);
    try {
      const res = await api.patch(`/player-subscriptions/${rejectId}/reject`, {
        reason: rejectReason.trim()
      });
      setSuccessMsg(res.data.message || 'Subscription request rejected.');
      setRejectId(null);
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(getApiError(err, 'Failed to reject subscription request.'));
    } finally {
      setSubmittingReject(false);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
            Subscription Requests
          </h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Review manual bank transfer receipts and activate player memberships
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-6 rounded-lg bg-[rgba(34,197,94,.1)] border border-[rgba(34,197,94,.2)] text-[var(--color-primary)] text-[0.875rem] font-semibold shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-6 rounded-lg bg-[var(--color-danger-bg)] border border-[rgba(239,68,68,.2)] text-[var(--color-danger)] text-[0.875rem] font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-24">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm">Loading pending requests…</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-16 shadow-sm text-center">
          <div className="text-5xl opacity-40 mb-4">📥</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-1">No pending subscription requests</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            When players subscribe to your membership plans and upload bank receipts, they will appear here for validation.
          </p>
        </div>
      )}

      {/* Requests Grid/Table */}
      {!loading && requests.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-slate-50/[0.3] text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <th className="px-6 py-4.5">Player Info</th>
                  <th className="px-6 py-4.5">Plan Applied</th>
                  <th className="px-6 py-4.5">Reference Code</th>
                  <th className="px-6 py-4.5">Price Paid</th>
                  <th className="px-6 py-4.5">Submitted At</th>
                  <th className="px-6 py-4.5 text-center">Transfer Receipt</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {requests.map((req) => (
                  <tr key={req.id} className="text-sm hover:bg-slate-50/[0.1] transition-colors">
                    {/* Player Info */}
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="font-bold text-[var(--color-text-base)]">{req.player.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{req.player.email}</p>
                        {req.player.phoneNumber && (
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">📞 {req.player.phoneNumber}</p>
                        )}
                      </div>
                    </td>

                    {/* Plan Applied */}
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="font-semibold text-[var(--color-text-base)]">{req.subscriptionPlan.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Duration: {req.subscriptionPlan.duration} Days</p>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-6 py-4.5">
                      <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {req.subscriptionCode}
                      </span>
                    </td>

                    {/* Price Paid */}
                    <td className="px-6 py-4.5 font-bold text-[var(--color-text-base)]">
                      {req.pricePaid.toLocaleString()} ETB
                    </td>

                    {/* Submitted At */}
                    <td className="px-6 py-4.5 text-xs text-[var(--color-text-muted)] font-semibold">
                      {req.playerSubmittedAt ? new Date(req.playerSubmittedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>

                    {/* Transfer Receipt Preview */}
                    <td className="px-6 py-4.5 text-center">
                      {req.receiptImageUrl ? (
                        <button
                          onClick={() => setPreviewImage(req.receiptImageUrl)}
                          className="group relative inline-block rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all bg-slate-100"
                        >
                          <img
                            src={`${API_BASE_URL}${req.receiptImageUrl}`}
                            alt="Receipt preview"
                            className="w-12 h-12 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] text-white font-bold tracking-tight">View</span>
                          </div>
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">No image</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRejectClick(req.id)}
                          className="px-3 py-1.5 text-xs font-bold text-[var(--color-danger)] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary)] shadow-sm rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full-Screen Receipt Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[4px]">
          <div className="relative max-w-3xl w-full flex flex-col items-center bg-[var(--color-surface-card)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-slate-50/[0.2]">
              <span className="text-sm font-bold text-[var(--color-text-base)]">Bank Transfer Receipt Preview</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Image Container */}
            <div className="p-6 max-h-[70vh] overflow-y-auto flex items-center justify-center w-full bg-slate-900/[0.03]">
              <img
                src={`${API_BASE_URL}${previewImage}`}
                alt="Receipt Full View"
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow"
              />
            </div>
            {/* Modal Footer */}
            <div className="w-full px-6 py-4 border-t border-[var(--color-border)] bg-slate-50/[0.2] flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason input Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="max-w-md w-full bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-slate-50/[0.2] flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--color-text-base)]">Reject Subscription Request</span>
              <button
                onClick={() => setRejectId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                Please enter the reason for rejecting this transaction. This message will be displayed to the player.
              </p>
              <textarea
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white resize-y min-h-[90px]"
                placeholder="e.g. Reference code not found on our statements / Transaction screenshot is blurry..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="px-5 py-3.5 border-t border-[var(--color-border)] bg-slate-50/[0.2] flex justify-end gap-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-slate-50 transition-colors"
                disabled={submittingReject}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[var(--color-danger)] hover:bg-red-600 border border-[var(--color-danger)] shadow-sm rounded-lg transition-all disabled:opacity-50"
                disabled={submittingReject || !rejectReason.trim()}
              >
                {submittingReject ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
