import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';

interface FAQItem {
  question: string;
  answer: string;
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Kickoff Starter',
      description: 'Ideal for independent local turfs managing a single stadium with basic manual scheduling.',
      priceETB: 1000,
      priceUSD: 19,
      features: [
        '1 Turf Branch Location',
        'Manual Slot Management & Scheduling',
        'Manual Cash Booking Entries',
        '1 Bank Account Integrated (CBE/Telebirr)',
        'Basic Dashboard Analytics',
        'Standard Email Support'
      ],
      notIncluded: [
        'Automatic Slot Schedule Generator Flow',
        'Secure Receipt Verification Flow',
        'Visual Earnings Area Charts',
        'Multiple Bank Accounts Integration',
        'Reviews & Player Feedback Replies'
      ],
      popular: false,
      ctaText: 'Start Free Trial',
      badge: 'Starter'
    },
    {
      id: 'pro',
      name: 'Pro Turf Master',
      description: 'Our most popular plan. Outfitted with automatic scheduling, receipt verification, and advanced metrics.',
      priceETB: 2500,
      priceUSD: 49,
      features: [
        'Up to 3 Turf Branch Locations',
        'Automatic Slot Schedule Generator Flow',
        'Secure Receipt Verification Flow',
        'Visual Earnings Area Charts & Stats',
        'Up to 3 Bank Accounts Integrated',
        'Reviews & Player Feedback Replies',
        'Priority Chat & Email Support (24/7)'
      ],
      notIncluded: [
        'Unlimited Stadium Branches',
        'Unlimited Bank Accounts Integrated'
      ],
      popular: true,
      ctaText: 'Go Pro Today',
      badge: 'Most Popular'
    },
    {
      id: 'elite',
      name: 'Elite Arena Complex',
      description: 'Designed for large multi-turf complex networks and franchises seeking ultimate limits.',
      priceETB: 5000,
      priceUSD: 99,
      features: [
        'Unlimited Turf Branch Locations',
        'Automatic Slot Schedule Generator Flow',
        'Secure Receipt Verification Flow',
        'Visual Earnings Area Charts & Stats',
        'Unlimited Bank Accounts Integrated',
        'Reviews & Player Feedback Replies',
        'Priority Chat, Email & Phone Support (24/7)'
      ],
      notIncluded: [],
      popular: false,
      ctaText: 'Start Elite Tier',
      badge: 'Enterprise'
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'How do stadium owners make revenue with KOAS?',
      answer: 'Stadium owners list their turf branches, define time slots, and set prices. Players find and book these slots via the KOAS mobile app. Payment can be processed on-site (Cash) or via mobile bank transfer (CBE, Telebirr, etc.) with players uploading transfer receipts that owners verify and approve directly in the owner dashboard.'
    },
    {
      question: 'Can I change my subscription plan later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time directly from your dashboard settings. If you upgrade, the new tier features will be unlocked instantly, and billing will be prorated accordingly.'
    },
    {
      question: 'How does the receipt verification system work?',
      answer: 'To prevent fraud and duplicate payments, players upload an image of their bank transaction receipt via the mobile app. Stadium owners instantly see this pending receipt on their booking dashboard, review the transaction details, and click "Approve" to lock in the booking, or "Reject" if the receipt is invalid or already used.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! All plans include a 14-day free trial, allowing you to list your turf, generate slots, and receive live bookings from players without paying anything upfront.'
    },
    {
      question: 'Are there any hidden transaction fees?',
      answer: 'No hidden fees. KOAS operates on a transparent flat SaaS subscription plan (Starter, Pro, or Elite). All turf booking revenue goes 100% directly to your bank account, without KOAS taking any percentage cuts.'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    navigate(`/register?plan=${planId}&billing=monthly`);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="w-full">
      {/* Premium Hero Section */}
      <HeroSection />

      {/* Premium Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Header & Toggle */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Transparent Pricing. No Hidden Cuts.
          </h2>
          <p className="mt-4 text-base text-[#9ca3af] leading-relaxed">
            Keep 100% of your turf bookings income. Pay only a simple flat subscription to maintain your listing and access advanced stadium dashboard tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-b from-[#111819] to-[#0d0f11] border rounded-2xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? 'border-[#16a34a] shadow-[#16a34a]/10 ring-1 ring-[#16a34a]/30'
                  : 'border-[#1f2d2a] hover:border-[#1f2d2a]/80'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#16a34a] to-[#10b981] text-xs font-bold text-white uppercase tracking-wider shadow-md">
                  {plan.badge}
                </span>
              )}

              {/* Top Section */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed min-h-[36px]">{plan.description}</p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {plan.priceETB.toLocaleString()} ETB
                  </span>
                  <span className="text-xs text-[#9ca3af]">/month</span>
                </div>
                <div className="text-xs text-[#4ade80] font-semibold mt-1">
                  ~ ${plan.priceUSD}/mo (billed monthly)
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-[#1f2d2a]/80" />

                {/* Features List */}
                <ul className="space-y-3.5 text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[#d1d5db]">{feature}</span>
                    </li>
                  ))}
                  
                  {/* Exclusions */}
                  {plan.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 opacity-40">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span className="text-[#9ca3af] line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full mt-8 py-3.5 px-4 rounded-lg text-sm font-bold tracking-wide transition-all shadow-md ${
                  plan.popular
                    ? 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow-lg hover:shadow-[#16a34a]/30'
                    : 'bg-[#1f2d2a] hover:bg-[#2d3d37] text-white border border-[#2d3d37] hover:text-[#4ade80]'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1f2d2a]/30 hidden md:block">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Compare Plan Specifications</h3>
          <p className="text-sm text-[#9ca3af] mt-2">Find the exact operational features right for your turf complexity.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1f2d2a] bg-[#0c1210]/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f2d2a] bg-[#111819]/50 text-xs font-bold text-[#4ade80] tracking-widest uppercase">
                <th className="p-6">Feature Details</th>
                <th className="p-6">Kickoff Starter</th>
                <th className="p-6">Pro Turf Master</th>
                <th className="p-6">Elite Arena Complex</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#1f2d2a]/55">
              {[
                { name: 'Turf Branch Locations', star: '1 Branch', pro: 'Up to 3 Branches', elite: 'Unlimited' },
                { name: 'Slot Schedule Engine', star: 'Manual entries', pro: 'Auto Generator', elite: 'Auto Generator + Rules' },
                { name: 'Receipt Verification', star: 'Basic (Offline)', pro: 'Secure Online Flow', elite: 'Fraud-Proof Flow' },
                { name: 'Revenue Analytics', star: 'Basic Metrics', pro: 'Detailed Graph Chart', elite: 'Premium Area Charts' },
                { name: 'Integrated Bank Accounts', star: '1 Account', pro: 'Up to 3 Accounts', elite: 'Unlimited' },
                { name: 'Platform Commissions', star: '0% Flat Rate', pro: '0% Flat Rate', elite: '0% Flat Rate' },
                { name: 'Admin Account Gate', star: 'Standard Approval', pro: 'Standard Approval', elite: 'Instant Priority Approval' },
                { name: 'Support Availability', star: 'Email (24-48h)', pro: 'Chat/Email (24/7)', elite: 'Dedicated Account Manager' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#111819]/35 text-[#d1d5db]">
                  <td className="p-5 font-medium text-white">{row.name}</td>
                  <td className="p-5">{row.star}</td>
                  <td className="p-5 font-semibold text-[#4ade80]">{row.pro}</td>
                  <td className="p-5 font-semibold text-[#4ade80]">{row.elite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20 border-t border-[#1f2d2a]/30">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-3 text-sm text-[#9ca3af]">Everything you need to know about setting up your turf with KOAS.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#111819] border border-[#1f2d2a] rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-white hover:text-[#4ade80] transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#4ade80]' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-[300px] border-t border-[#1f2d2a]/60' : 'max-h-0'
                  }`}
                >
                  <p className="p-6 text-sm text-[#9ca3af] leading-relaxed bg-[#0c1210]/40">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-r from-[#111819] via-[#0d1512] to-[#111819] border border-[#1f2d2a] p-10 sm:p-16 rounded-3xl relative overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-r from-[#16a34a] via-transparent to-transparent pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Ready to Streamline Your Stadium Business?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto leading-relaxed">
            Create an account, select your subscription plan, and start accepting soccer bookings under 5 minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-lg shadow-lg shadow-[#16a34a]/30 hover:shadow-xl transition-all no-underline text-center">
              Claim 14-Day Free Trial
            </Link>
            <a href="mailto:support@koas.com" className="w-full sm:w-auto px-8 py-4 bg-[#1f2d2a] hover:bg-[#2d3d37] text-white font-bold rounded-lg transition-all border border-[#2d3d37] no-underline text-center">
              Contact Sales Support
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#4ade80] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Cancel at any time. Fully encrypted 256-bit transactions.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
