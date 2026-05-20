import prisma from '../config/prisma.js';

/**
 * Resolves the active subscription tier for a user.
 * Newly registered stadium owners get a 14-day free trial where all features are unlocked (ELITE access).
 * After the trial, their specific subscription plan (STARTER, PRO, or ELITE) takes effect.
 *
 * @param {string} userId - The user ID to check.
 * @returns {Promise<'STARTER' | 'PRO' | 'ELITE'>} The active tier.
 */
export const getActiveTier = async (userId) => {
  if (!userId) return 'STARTER';

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, subscriptionPlan: true }
  });

  if (!user) return 'STARTER';

  const trialDurationMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
  const isTrialActive = (new Date() - new Date(user.createdAt)) < trialDurationMs;

  if (isTrialActive) {
    return 'ELITE'; // All premium features unlocked during 14-day trial
  }

  return user.subscriptionPlan || 'STARTER';
};
