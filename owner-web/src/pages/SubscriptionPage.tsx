import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveTier, getTrialDaysRemaining, isTrialActive, TIER_LIMITS, SubscriptionTier } from '../utils/tier';
import api from '../api/axios';

interface Location {
  id: string;
  name: string;
  images: string[];
}

interface Stadium {
  id: string;
  name: string;
  locations?: Location[];
}

interface BankAccount {
  id: string;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  
  const activeTier = getActiveTier(user);
  const trialDays = getTrialDaysRemaining(user);
  const isTrial = isTrialActive(user);

  const [locationsCount, setLocationsCount] = useState(0);
  const [banksCount, setBanksCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsageMetrics = async () => {
      try {
        const stadiumRes = await api.get('/stadiums/my');
        const stadium: Stadium = stadiumRes.data[0];
        if (stadium && stadium.locations) {
          setLocationsCount(stadium.locations.length);
        }

        const banksRes = await api.get('/bank-accounts/my');
        const banks: BankAccount[] = banksRes.data;
        if (banks) {
          setBanksCount(banks.length);
        }

        const plansRes = await api.get('/subscription-plans/my');
        const plansData: any[] = plansRes.data;
        if (plansData) {
          setPlansCount(plansData.length);
        }
      } catch (err) {
        console.error('Failed to load usage metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsageMetrics();
  }, []);

  const plans = [
    {
      id: 'STARTER',
      name: 'Kickoff Starter',
      description: 'Ideal for independent local turfs managing a single stadium with basic manual scheduling.',
      priceETB: 1000,
      priceUSD: 6.67,
      features: [
        '1 Turf Branch Location',
        'Manual Slot Management & Scheduling',
        'Secure Receipt Verification Flow',
        '1 Bank Account Integrated (CBE/Telebirr)',
        '1 Player Membership Plan template max',
        'Basic Booking Counts & Stats'
      ],
      limitsText: {
        locations: '1 Branch max',
        banks: '1 Account max',
        playerPlans: '1 Plan max',
        autoSlots: 'Disabled',
        replies: 'Disabled'
      }
    },
    {
      id: 'PRO',
      name: 'Pro Turf Master',
      description: 'Our most popular plan. Outfitted with automatic scheduling, receipt verification, and advanced metrics.',
      priceETB: 2500,
      priceUSD: 16.67,
      features: [
        'Up to 3 Turf Branch Locations',
        'Automatic Slot Schedule Generator Flow',
        'Secure Receipt Verification Flow',
        'Visual Earnings Area Charts & Stats',
        'Up to 3 Bank Accounts Integrated',
        'Up to 3 Player Membership Plan templates',
        'Reviews & Player Feedback Replies',
        'Advanced Booking Insights (Daily Revenue Chart & Peak Slots Hours)'
      ],
      limitsText: {
        locations: 'Up to 3 Branches',
        banks: 'Up to 3 Accounts',
        playerPlans: 'Up to 3 Plans',
        autoSlots: 'Fully Enabled',
        replies: 'Fully Enabled'
      },
      popular: true
    },
    {
      id: 'ELITE',
      name: 'Elite Arena Complex',
      description: 'Designed for large multi-turf complex networks and franchises seeking ultimate limits.',
      priceETB: 5000,
      priceUSD: 33.33,
      features: [
        'Unlimited Turf Branch Locations',
        'Automatic Slot Schedule Generator Flow',
        'Secure Receipt Verification Flow',
        'Visual Earnings Area Charts & Stats',
        'Unlimited Bank Accounts Integrated',
        'Up to 10 Player Membership Plan templates',
        'Reviews & Player Feedback Replies',
        'Elite AI Analytics (Daily Revenue Chart, Peak Hours, Circular Loyalty Ring & Forecasts)'
      ],
      limitsText: {
        locations: 'Unlimited Branches',
        banks: 'Unlimited Accounts',
        playerPlans: 'Up to 10 Plans',
        autoSlots: 'Fully Enabled',
        replies: 'Fully Enabled'
      }
    }
  ];

  const limits = TIER_LIMITS[activeTier];

  return (
    <div className="w-full text-left">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
          Plan & Billing
        </h1>
        <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
          Manage your subscription plans, view real-time account caps, and scale your stadium features.
        </p>
      </div>

      {/* Trial Countdown or Active Banner */}
      {isTrial ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0f2d1a] to-[#022c22] border border-[#22c55e]/30 rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-[#22c55e]/15 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-3xl animate-bounce">
              👑
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                14-Day Free Trial Active
                <span className="text-[10px] bg-[#22c55e] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Elite Unlocked
                </span>
              </h3>
              <p className="text-sm text-[#a7f3d0] mt-1 leading-relaxed max-w-xl">
                You are currently in your trial period. All Elite features are fully unlocked! Your trial will automatically transition to your registered plan afterwards.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-center bg-[#0c1a12]/60 border border-[#22c55e]/20 px-5 py-3.5 rounded-xl min-w-[140px]">
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Remaining Time</p>
            <p className="text-3xl font-black text-[#4ade80] tracking-tight mt-1">{trialDays} Days</p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary-bg)] border border-[#bbf7d0] flex items-center justify-center text-3xl">
              ⚽
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--color-text-base)] tracking-tight">
                Active Subscription: <span className="text-[var(--color-primary)]">{activeTier}</span>
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Your stadium is running with the standard limits of the {activeTier.toLowerCase()} tier.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-center bg-[var(--color-surface-muted)] border border-[var(--color-border)] px-5 py-3.5 rounded-xl min-w-[140px]">
            <p className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Exchange Rate</p>
            <p className="text-lg font-black text-[var(--color-text-base)] tracking-tight mt-1">$1 = 150 ETB</p>
          </div>
        </div>
      )}

      {/* Real-time Usage & Limits Gating Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Location Usage Card */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Turf Locations Limit</p>
              <h4 className="text-2xl font-black text-[var(--color-text-base)] mt-1">
                {loading ? '...' : locationsCount} <span className="text-sm font-semibold text-[var(--color-text-muted)]">/ {limits.maxLocations === Infinity ? 'Unlimited' : limits.maxLocations}</span>
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
              {limits.maxLocations === Infinity ? 'Elite' : `${limits.maxLocations} Allowed`}
            </div>
          </div>

          <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                locationsCount >= limits.maxLocations && limits.maxLocations !== Infinity
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{
                width: limits.maxLocations === Infinity ? '100%' : `${Math.min(100, (locationsCount / limits.maxLocations) * 100)}%`
              }}
            />
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)]">
            {limits.maxLocations === Infinity 
              ? 'Enjoy unrestricted branch creations across any city or region.'
              : `${limits.maxLocations - locationsCount} branch slots remaining before hitting plan threshold.`}
          </p>
        </div>

        {/* Bank Account Usage Card */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Integrated Banks Limit</p>
              <h4 className="text-2xl font-black text-[var(--color-text-base)] mt-1">
                {loading ? '...' : banksCount} <span className="text-sm font-semibold text-[var(--color-text-muted)]">/ {limits.maxBankAccounts === Infinity ? 'Unlimited' : limits.maxBankAccounts}</span>
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
              {limits.maxBankAccounts === Infinity ? 'Elite' : `${limits.maxBankAccounts} Allowed`}
            </div>
          </div>

          <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                banksCount >= limits.maxBankAccounts && limits.maxBankAccounts !== Infinity
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{
                width: limits.maxBankAccounts === Infinity ? '100%' : `${Math.min(100, (banksCount / limits.maxBankAccounts) * 100)}%`
              }}
            />
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)]">
            {limits.maxBankAccounts === Infinity 
              ? 'Receive payments directly to any dynamic bank setup without limits.'
              : `${limits.maxBankAccounts - banksCount} account slots remaining before hitting plan threshold.`}
          </p>
        </div>

        {/* Player Membership Plan Usage Card */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Membership Plans Limit</p>
              <h4 className="text-2xl font-black text-[var(--color-text-base)] mt-1">
                {loading ? '...' : plansCount} <span className="text-sm font-semibold text-[var(--color-text-muted)]">/ {limits.maxPlayerSubscriptionPlans === Infinity ? 'Unlimited' : limits.maxPlayerSubscriptionPlans}</span>
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
              {limits.maxPlayerSubscriptionPlans === Infinity ? 'Elite' : `${limits.maxPlayerSubscriptionPlans} Allowed`}
            </div>
          </div>

          <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                plansCount >= limits.maxPlayerSubscriptionPlans && limits.maxPlayerSubscriptionPlans !== Infinity
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{
                width: limits.maxPlayerSubscriptionPlans === Infinity ? '100%' : `${Math.min(100, (plansCount / limits.maxPlayerSubscriptionPlans) * 100)}%`
              }}
            />
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)]">
            {limits.maxPlayerSubscriptionPlans === Infinity 
              ? 'Offer unlimited diverse passes and bundles to target different player groups.'
              : `${limits.maxPlayerSubscriptionPlans - plansCount} membership plan slots remaining before hitting plan threshold.`}
          </p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="text-center max-w-3xl mx-auto mb-8 mt-12">
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-base)] tracking-tight">
          Select Pricing Tier
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Keep 100% of your stadium ticket revenues. Switch plans instantly by contacting our local team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
        {plans.map((plan) => {
          const isCurrent = user?.subscriptionPlan?.toUpperCase() === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-b from-[var(--color-surface-card)] to-[var(--color-surface-muted)] border rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? 'border-[var(--color-primary)] shadow-[rgba(22,163,74,0.1)] ring-1 ring-[var(--color-primary)]/20'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#16a34a] to-[#10b981] text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                  Most Popular
                </span>
              )}

              {/* Card Top Details */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--color-text-base)]">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] bg-[var(--color-primary-bg)] border border-[#bbf7d0] text-[var(--color-primary)] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                      Registered
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-base)]">
                    {plan.priceETB.toLocaleString()} ETB
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">/month</span>
                </div>
                <div className="text-[11px] text-[var(--color-primary)] font-semibold mt-1">
                  ~ ${plan.priceUSD}/mo (billed monthly)
                </div>

                {/* Limits Specs */}
                <div className="my-5 border-t border-[var(--color-border)]" />
                <div className="bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl p-3.5 mb-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">Locations:</span>
                    <span className="text-[var(--color-text-base)] font-bold">{plan.limitsText.locations}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">Bank Accounts:</span>
                    <span className="text-[var(--color-text-base)] font-bold">{plan.limitsText.banks}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">Membership Plans:</span>
                    <span className="text-[var(--color-text-base)] font-bold">{plan.limitsText.playerPlans}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">Auto Generator:</span>
                    <span className="text-[var(--color-text-base)] font-bold">{plan.limitsText.autoSlots}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">Review Replies:</span>
                    <span className="text-[var(--color-text-base)] font-bold">{plan.limitsText.replies}</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Trigger */}
              <button
                disabled={isCurrent}
                onClick={() => {
                  alert(`Please contact our support team to request activation or change of your plan to the "${plan.name}".`);
                }}
                className={`w-full mt-6 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm ${
                  isCurrent
                    ? 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-default'
                    : plan.popular
                      ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'
                      : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-base)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Help / Local Support Matrix - Premium Glassmorphic Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1a12] to-[#0f1e15] border border-[rgba(22,163,74,0.15)] rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#16a34a]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-[#10b981]/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              🛡️ Subscription Renewal & Upgrade Assistance
            </h3>
            <p className="text-xs text-[#a7f3d0] mt-1.5 leading-relaxed max-w-2xl">
              We process subscription activations manually via secure local transfers. To upgrade your plan, request custom features, or clear bank detail limits instantly, please contact our support team.
            </p>
          </div>
          <div className="relative" ref={contactRef}>
            <button
              onClick={() => setContactOpen(!contactOpen)}
              className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-[#064e3b] bg-[#4ade80] hover:bg-[#6ee7b7] transition-all whitespace-nowrap shadow-md shadow-[#4ade80]/20 cursor-pointer border-none gap-2"
            >
              Contact Support
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${contactOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {contactOpen && (
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-64 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50">
                <a
                  href="mailto:koasmeda21@gmail.com"
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-colors no-underline border-b border-[var(--color-border)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold text-[var(--color-text-base)]">By Email</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">koasmeda21@gmail.com</div>
                  </div>
                </a>
                <a
                  href="tel:0981559200"
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-colors no-underline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold text-[var(--color-text-base)]">By Phone</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">0981559200</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
