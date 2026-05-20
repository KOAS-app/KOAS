export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  createdAt: string;
}

export type SubscriptionTier = 'STARTER' | 'PRO' | 'ELITE';

export const getActiveTier = (user: User | null): SubscriptionTier => {
  if (!user) return 'STARTER';
  
  const trialDurationMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
  const elapsedMs = new Date().getTime() - new Date(user.createdAt).getTime();
  const isTrialActive = elapsedMs < trialDurationMs;
  
  if (isTrialActive) {
    return 'ELITE';
  }
  
  return (user.subscriptionPlan || 'STARTER').toUpperCase() as SubscriptionTier;
};

export const getTrialDaysRemaining = (user: User | null): number => {
  if (!user) return 0;
  const trialDurationMs = 14 * 24 * 60 * 60 * 1000;
  const elapsedMs = new Date().getTime() - new Date(user.createdAt).getTime();
  const remainingMs = trialDurationMs - elapsedMs;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
};

export const isTrialActive = (user: User | null): boolean => {
  if (!user) return false;
  const trialDurationMs = 14 * 24 * 60 * 60 * 1000;
  const elapsedMs = new Date().getTime() - new Date(user.createdAt).getTime();
  return elapsedMs < trialDurationMs;
};

export const TIER_LIMITS = {
  STARTER: {
    maxLocations: 1,
    maxBankAccounts: 1,
    autoSlotGenerator: false,
    reviewReplies: false,
    analytics: false,
    maxPlayerSubscriptionPlans: 1,
  },
  PRO: {
    maxLocations: 3,
    maxBankAccounts: 3,
    autoSlotGenerator: true,
    reviewReplies: true,
    analytics: true,
    maxPlayerSubscriptionPlans: 3,
  },
  ELITE: {
    maxLocations: Infinity,
    maxBankAccounts: Infinity,
    autoSlotGenerator: true,
    reviewReplies: true,
    analytics: true,
    maxPlayerSubscriptionPlans: 10,
  },
};
