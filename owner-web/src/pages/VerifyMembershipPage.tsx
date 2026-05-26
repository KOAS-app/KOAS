import { useState } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

interface Player {
  name: string;
  email: string;
  phoneNumber: string | null;
}

interface Stadium {
  name: string;
}

interface SubscriptionPlan {
  name: string;
  price: number;
  duration: number;
  stadium: Stadium;
}

interface Subscription {
  id: string;
  status: string;
  subscriptionCode: string;
  pricePaid: number;
  startDate: string | null;
  endDate: string | null;
  ownerRejectionReason: string | null;
  player: Player;
  subscriptionPlan: SubscriptionPlan;
}

interface Slot {
  startTime: string;
  endTime: string;
  location: string;
  price: number;
}

interface Booking {
  id: string;
  bookingCode: string;
  status: string;
  createdAt: string;
  slot: Slot;
  stadium: Stadium;
  player: Player;
  payment?: {
    status: string;
  };
}

type VerificationResult = 
  | { type: 'subscription'; data: Subscription }
  | { type: 'booking'; data: Booking }
  | null;

export default function VerifyMembershipPage() {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VerificationResult>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    let code = searchCode.trim().toUpperCase();

    try {
      // Check if it's a booking code (BK-) or subscription code (KS-)
      if (code.startsWith('BK-') || (!code.startsWith('KS-') && code.length <= 9)) {
        // Booking code verification
        if (!code.startsWith('BK-')) {
          code = `BK-${code}`;
        }
        
        const res = await api.get(`/bookings/verify/${code}`);
        setResult({ type: 'booking', data: res.data.booking });
      } else {
        // Subscription code verification
        if (!code.startsWith('KS-')) {
          code = `KS-${code}`;
        }
        
        const res = await api.get(`/player-subscriptions/verify/${code}`);
        setResult({ type: 'subscription', data: res.data.subscription });
      }
    } catch (err) {
      setError(getApiError(err, 'Failed to verify. Please check the code and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDateStr: string | null): { days: number; isExpired: boolean } => {
    if (!endDateStr) return { days: 0, isExpired: false };
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: Math.abs(diffDays),
      isExpired: diffDays < 0
    };
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-2">
          Verify Player Pass
        </h1>
        <p className="text-[var(--color-text-muted)] text-[0.9375rem] max-w-md mx-auto">
          Scan a player's QR code or enter their membership/booking code to verify check-in eligibility.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-6 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono font-bold text-sm">
              Code:
            </span>
            <input
              type="text"
              className="w-full pl-16 pr-3.5 py-3 border-[1.5px] border-[var(--color-border)] rounded-xl bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] font-mono uppercase tracking-widest hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]"
              placeholder="KS-XXXX or BK-XXXXXX"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchCode.trim()}
            className="sm:px-6 py-3 font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary)] shadow-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Verify Code
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Output */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[var(--color-danger-bg)] border border-[rgba(239,68,68,.2)] text-[var(--color-danger)] text-[0.875rem] font-semibold text-center justify-center shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Verification Card Visual Result */}
      {result && result.type === 'subscription' && (
        <div className="transition-all animate-in fade-in duration-300">
          {/* Card Border wrapper with colored glow based on status */}
          <div className={`relative overflow-hidden rounded-[20px] border shadow-lg transition-all p-6 ${
            result.data.status === 'ACTIVE' 
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/[0.2] to-emerald-100/[0.05] shadow-emerald-500/10'
              : result.data.status === 'EXPIRED'
                ? 'border-red-400 bg-gradient-to-br from-red-50/[0.2] to-red-100/[0.05] shadow-red-500/10'
                : 'border-amber-400 bg-gradient-to-br from-amber-50/[0.2] to-amber-100/[0.05] shadow-amber-500/10'
          }`}>
            
            {/* Holographic header design */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-5">
              <div>
                <p className="text-[0.625rem] font-black uppercase tracking-[0.15em] text-slate-400">MEMBERSHIP PASS</p>
                <p className="text-[1.25rem] font-black text-[var(--color-text-base)] mt-1">{result.data.subscriptionPlan.stadium.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">ID: {result.data.subscriptionCode}</p>
              </div>

              {/* High fidelity dynamic status badge */}
              <div>
                {result.data.status === 'ACTIVE' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 border border-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ACTIVE PASS
                  </div>
                ) : result.data.status === 'EXPIRED' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 border border-red-400">
                    EXPIRED
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 border border-amber-400">
                    PENDING APPROVAL
                  </div>
                )}
              </div>
            </div>

            {/* Member Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Player info */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Member / Player</label>
                  <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] mt-1">{result.data.player.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{result.data.player.email}</p>
                  {result.data.player.phoneNumber && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">📞 {result.data.player.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valid Validity Period</label>
                  {result.data.startDate && result.data.endDate ? (
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1.5">
                      📅 {new Date(result.data.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} to{' '}
                      {new Date(result.data.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 italic">Not yet activated</p>
                  )}
                </div>
              </div>

              {/* Right Column: Plan & Verification Status */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Membership Tier</label>
                  <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] mt-1">{result.data.subscriptionPlan.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{result.data.subscriptionPlan.duration} Days Unlimited Pass</p>
                </div>

                {/* Remaining Days Glow widget */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification Outcome</label>
                  {result.data.status === 'ACTIVE' && result.data.endDate ? (
                    (() => {
                      const { days, isExpired } = getDaysRemaining(result.data.endDate);
                      return !isExpired ? (
                        <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <p className="text-lg font-black text-emerald-600 leading-none">{days}</p>
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-1">Days Remaining (Access Granted)</p>
                        </div>
                      ) : (
                        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-lg font-black text-red-600 leading-none">Expired</p>
                          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mt-1">Expired {days} days ago (Access Denied)</p>
                        </div>
                      );
                    })()
                  ) : result.data.status === 'EXPIRED' && result.data.endDate ? (
                    (() => {
                      const { days } = getDaysRemaining(result.data.endDate);
                      return (
                        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-lg font-black text-red-600 leading-none">Expired</p>
                          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mt-1">Expired {days} days ago (Access Denied)</p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-sm font-bold text-amber-700 leading-normal">
                        Receipt is currently pending verification. Go to Subscription Requests to approve.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection notice if rejected */}
            {result.data.status === 'REJECTED' && result.data.ownerRejectionReason && (
              <div className="mt-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">Rejection Reason:</span>
                {result.data.ownerRejectionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Verification Card */}
      {result && result.type === 'booking' && (
        <div className="transition-all animate-in fade-in duration-300">
          <div className={`relative overflow-hidden rounded-[20px] border shadow-lg transition-all p-6 ${
            result.data.status === 'CONFIRMED' && result.data.payment?.status === 'PAID'
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/[0.2] to-emerald-100/[0.05] shadow-emerald-500/10'
              : result.data.status === 'CANCELLED'
                ? 'border-red-400 bg-gradient-to-br from-red-50/[0.2] to-red-100/[0.05] shadow-red-500/10'
                : 'border-amber-400 bg-gradient-to-br from-amber-50/[0.2] to-amber-100/[0.05] shadow-amber-500/10'
          }`}>
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-5">
              <div>
                <p className="text-[0.625rem] font-black uppercase tracking-[0.15em] text-slate-400">BOOKING PASS</p>
                <p className="text-[1.25rem] font-black text-[var(--color-text-base)] mt-1">{result.data.stadium.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">CODE: {result.data.bookingCode}</p>
              </div>

              {/* Status badge */}
              <div>
                {result.data.status === 'CONFIRMED' && result.data.payment?.status === 'PAID' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 border border-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    VALID BOOKING
                  </div>
                ) : result.data.status === 'CANCELLED' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 border border-red-400">
                    CANCELLED
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 border border-amber-400">
                    PENDING PAYMENT
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Player info */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Player</label>
                  <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] mt-1">{result.data.player.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{result.data.player.email}</p>
                  {result.data.player.phoneNumber && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">📞 {result.data.player.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking Time</label>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1.5">
                    📅 {new Date(result.data.slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs font-semibold text-[var(--color-primary)] mt-1">
                    🕒 {new Date(result.data.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(result.data.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Right Column: Booking details */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</label>
                  <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] mt-1">📍 {result.data.slot.location}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Amount: {result.data.slot.price.toLocaleString()} ETB</p>
                </div>

                {/* Verification Status */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification Outcome</label>
                  {result.data.status === 'CONFIRMED' && result.data.payment?.status === 'PAID' ? (
                    <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-lg font-black text-emerald-600 leading-none">✓ Verified</p>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-1">Access Granted</p>
                    </div>
                  ) : result.data.status === 'CANCELLED' ? (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-lg font-black text-red-600 leading-none">Cancelled</p>
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mt-1">Access Denied</p>
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-sm font-bold text-amber-700 leading-normal">
                        Payment pending. Check Bookings page to confirm payment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
