import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import type { SubscriptionPlan } from '../types';
import SubscriptionPlanModal from '../components/SubscriptionPlanModal';
import { useAuth } from '../context/AuthContext';
import { getActiveTier, TIER_LIMITS } from '../utils/tier';

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeTier = getActiveTier(user);
  const limits = TIER_LIMITS[activeTier];
  const maxPlans = limits.maxPlayerSubscriptionPlans;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [checkingBankDetails, setCheckingBankDetails] = useState(true);

  const isLimitReached = plans.length >= maxPlans;

  useEffect(() => {
    fetchPlans();
    checkBankDetails();
  }, []);

  const checkBankDetails = async () => {
    try {
      const res = await api.get('/stadiums/my');
      const stadium = res.data[0];
      const hasBank = stadium?.bankAccounts && stadium.bankAccounts.length > 0;
      setHasBankDetails(hasBank);
    } catch (err) {
      console.error('Failed to check bank details:', err);
      setHasBankDetails(false);
    } finally {
      setCheckingBankDetails(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscription-plans/my');
      setPlans(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load subscription plans.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!hasBankDetails) {
      setError('You must add bank account details before creating a subscription plan. Players need bank details to make payments.');
      return;
    }
    if (isLimitReached) {
      setError(`Your ${activeTier} plan allows a maximum of ${maxPlans} player subscription plan${maxPlans > 1 ? 's' : ''}.`);
      return;
    }
    setEditingPlan(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan? Players currently subscribed will lose their plan access.')) {
      return;
    }

    setActionLoading(id);
    try {
      await api.delete(`/subscription-plans/${id}`);
      setSuccess('Subscription plan deleted successfully!');
      fetchPlans();
    } catch (err) {
      setError(getApiError(err, 'Failed to delete subscription plan.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingPlan(null);
    setSuccess(editingPlan ? 'Subscription plan updated successfully!' : 'Subscription plan created successfully!');
    fetchPlans();
  };

  if (loading || checkingBankDetails) {
    return (
      <div className="flex items-center justify-center gap-3 py-16">
        <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-[var(--color-text-muted)] text-sm">Loading subscription plans…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
            Subscription Plans
          </h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Provide subscription plans for players to offer session bundles or memberships.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isLimitReached || !hasBankDetails}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Plan
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 mb-6 rounded-[10px] bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="text-[0.8125rem] leading-relaxed flex-1">
          <p className="font-bold mb-1">Predefined Subscription Packages ({activeTier} Plan)</p>
          <p className="text-[#1e40af]/80">
            Define specific periods (e.g. 30 days, 90 days) and prices. Active plans are immediately presented to players on the mobile app. You have created <span className="font-extrabold">{plans.length}</span> of {maxPlans} allowed plan{maxPlans !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>

      {/* Bank Details Required Warning */}
      {!hasBankDetails && (
        <div className="mb-6 p-4 rounded-[12px] bg-gradient-to-r from-[rgba(239,68,68,0.06)] to-[rgba(239,68,68,0.02)] border border-[rgba(239,68,68,0.25)] shadow-[0_4px_20px_rgba(239,68,68,0.05)] flex items-start gap-3">
          <span className="text-xl select-none">🏦</span>
          <div className="flex-1">
            <h4 className="text-[0.875rem] font-black text-[var(--color-text-base)] tracking-tight">
              Bank Account Required
            </h4>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
              You must add your bank account details before creating subscription plans. Players need this information to make payments for their subscriptions.
            </p>
            <button
              onClick={() => navigate('/bank-details')}
              className="mt-2.5 px-3 py-1.5 rounded-[6px] text-[0.75rem] font-bold text-white bg-[var(--color-danger)] hover:bg-[#dc2626] inline-flex items-center gap-1 transition-all group"
            >
              Add Bank Details
              <span className="inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Tier limit warning banner */}
      {isLimitReached && (
        <div className="mb-6 p-4 rounded-[12px] bg-gradient-to-r from-[rgba(217,119,6,0.06)] to-[rgba(217,119,6,0.02)] border border-[rgba(217,119,6,0.25)] shadow-[0_4px_20px_rgba(217,119,6,0.05)] flex items-start gap-3">
          <span className="text-xl select-none">👑</span>
          <div className="flex-1">
            <h4 className="text-[0.875rem] font-black text-[var(--color-text-base)] tracking-tight">
              Player Membership Plan Limit Reached
            </h4>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
              Your {activeTier} subscription allows up to {maxPlans} active player subscription plan{maxPlans > 1 ? 's' : ''}. Upgrade to create more package options for your customers.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-2.5 px-3 py-1.5 rounded-[6px] text-[0.75rem] font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] inline-flex items-center gap-1 transition-all group"
            >
              Upgrade Your Plan
              <span className="inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-sm font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] text-sm font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {success}
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">🎫</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">
            No subscription plans created
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
            Create membership tiers or package passes for your customers to access your turf regularly with loyalty benefits.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] animate-pulse"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Plans Grid */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col relative bg-[var(--color-surface-card)] border-[1.5px] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
                plan.isActive
                  ? 'border-[rgba(22,163,74,0.3)] hover:border-[rgba(22,163,74,0.5)]'
                  : 'border-[var(--color-border)] opacity-75'
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-bold tracking-wide uppercase ${
                    plan.isActive
                      ? 'bg-[#dcfce7] text-[#166534]'
                      : 'bg-gray-150 text-gray-500'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Icon / Decor */}
              <div className="w-10 h-10 rounded-lg bg-[rgba(22,163,74,0.1)] flex items-center justify-center text-xl mb-4">
                ⚽
              </div>

              {/* Info */}
              <h3 className="text-base font-extrabold text-[var(--color-text-base)] mb-1 leading-snug tracking-tight">
                {plan.name}
              </h3>
              
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-black text-[var(--color-primary)]">
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-[var(--color-text-muted)] text-[0.8125rem] font-semibold">
                  ETB / {plan.duration} Days
                </span>
              </div>

              {/* Allowed schedule details */}
              <div className="flex flex-col gap-1.5 mb-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg p-2.5">
                {plan.location && (
                  <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">
                    <span className="text-sm select-none">📍</span>
                    <span>{plan.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">
                  <span className="text-sm select-none">📅</span>
                  <span>{plan.openingDay} - {plan.closingDay}</span>
                </div>
                <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">
                  <span className="text-sm select-none">🕒</span>
                  <span>{plan.openingTime} - {plan.closingTime}</span>
                </div>
                <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">
                  <span className="text-sm select-none">⏱️</span>
                  <span>{plan.hoursPerDay || 1} {(plan.hoursPerDay || 1) === 1 ? 'hour' : 'hours'} per day</span>
                </div>
                <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[var(--color-primary)]">
                  <span className="text-sm select-none">🏆</span>
                  <span>Max {(plan.weeklyAllowedDays || 1) * Math.floor(plan.duration / 7)} play days ({plan.weeklyAllowedDays || 1} { (plan.weeklyAllowedDays || 1) === 1 ? 'day' : 'days' }/week)</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--color-border)] my-4 w-full" />

              {/* Description / Features */}
              <div className="flex-1">
                <p className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
                  What's Included:
                </p>
                {plan.description ? (
                  <ul className="flex flex-col gap-2">
                    {plan.description.split('\n').filter(Boolean).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[0.8125rem] text-[var(--color-text-muted)]">
                        <span className="text-[var(--color-primary)] font-bold text-xs mt-0.5">✓</span>
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[0.8125rem] text-[var(--color-text-muted)] italic">
                    No specific benefits listed.
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2.5 mt-6 pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => handleEdit(plan)}
                  disabled={actionLoading === plan.id}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all hover:bg-white hover:border-[var(--color-border-strong)]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  disabled={actionLoading === plan.id}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#fee2e2] bg-[#fef2f2] text-[var(--color-danger)] transition-all hover:bg-[#fee2e2]"
                >
                  {actionLoading === plan.id ? (
                    <div className="w-3.5 h-3.5 border-[1.5px] border-[rgba(220,38,38,0.3)] border-t-[var(--color-danger)] rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SubscriptionPlanModal
          plan={editingPlan}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
