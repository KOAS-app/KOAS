import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import { getActiveTier } from '../utils/tier';

interface FAQItem {
  question: string;
  answer: string;
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
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
  
  const activeTier = getActiveTier(user);

  const plans = [
    {
      id: 'starter',
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
      notIncluded: [
        'Automatic Slot Schedule Generator Flow',
        'Visual Earnings Area Charts',
        'Multiple Bank Accounts Integration',
        'Multiple Player Membership Plans',
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
      notIncluded: [
        'Unlimited Stadium Branches',
        'Unlimited Bank Accounts Integrated',
        'Up to 10 Player Membership Plans'
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
      answer: 'Yes! All new accounts begin with a 14-day free trial. During the trial period, your account is automatically upgraded to the Elite Arena Complex tier, giving you unrestricted access to try all platform features (such as automated slot generation, review replies, bank integrations, and player membership plans) completely free.'
    },
    {
      question: 'Are there any hidden transaction fees?',
      answer: 'No hidden fees. KOAS operates on a transparent flat subscription plan (Starter, Pro, or Elite). All turf booking revenue goes 100% directly to your bank account, without KOAS taking any percentage cuts.'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (user) {
      navigate('/subscription');
    } else {
      navigate(`/register?plan=${planId}&billing=monthly`);
    }
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
      <section id="pricing" className="relative z-10 py-12 sm:py-24">
        
        {/* Header & Toggle */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight">
            Transparent Pricing. No Hidden Cuts.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#9ca3af] leading-relaxed px-4">
            Keep 100% of your turf bookings income. Pay only a simple flat subscription to maintain your listing and access advanced stadium dashboard tools.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#16a34a]/10 border border-[#16a34a]/30 text-xs font-bold text-[#4ade80]">
            <span>🎁</span> 
            <span className="hidden sm:inline">All plans start with a 14-day free trial unlocking ALL features (Elite Tier) with zero risk</span>
            <span className="sm:hidden">14-day free trial - All Elite features</span>
          </div>
        </div>

        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="lg:max-w-7xl lg:mx-auto lg:px-4 sm:lg:px-6 lg:px-8">
          {/* Mobile Horizontal Scroll */}
          <div className="flex lg:hidden overflow-x-auto gap-6 px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex-shrink-0 w-[320px] relative bg-gradient-to-b from-[#111819] to-[#0d0f11] border rounded-2xl p-6 shadow-2xl flex flex-col justify-between snap-start ${
                  plan.popular
                    ? 'border-[#16a34a] shadow-[#16a34a]/10 ring-1 ring-[#16a34a]/30'
                    : 'border-[#1f2d2a]'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#16a34a] to-[#10b981] text-xs font-bold text-white uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </span>
                )}

                {/* Top Section */}
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed min-h-[36px]">{plan.description}</p>

                  {/* Price Display */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {plan.priceETB.toLocaleString()} ETB
                    </span>
                    <span className="text-xs text-[#9ca3af]">/month</span>
                  </div>
                  <div className="text-xs text-[#4ade80] font-semibold mt-1">
                    ~ ${plan.priceUSD}/mo (billed monthly)
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-[#1f2d2a]/80" />

                  {/* Features List */}
                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[#d1d5db]">{feature}</span>
                      </li>
                    ))}
                    
                    {/* Exclusions */}
                    {plan.notIncluded.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 opacity-40">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
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
                  className={`w-full mt-6 py-3 px-4 rounded-lg text-xs font-bold tracking-wide transition-all shadow-md ${
                    user && activeTier === plan.id.toUpperCase()
                      ? 'bg-[#1f2d2a]/30 text-slate-500 border border-[#1f2d2a]/40 cursor-default'
                      : plan.popular
                        ? 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow-lg hover:shadow-[#16a34a]/30'
                        : 'bg-[#1f2d2a] hover:bg-[#2d3d37] text-white border border-[#2d3d37] hover:text-[#4ade80]'
                  }`}
                >
                  {user
                    ? activeTier === plan.id.toUpperCase()
                      ? 'Current Plan'
                      : 'Manage Plan'
                    : plan.ctaText
                  }
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-b from-[#111819] to-[#0d0f11] border rounded-2xl p-8 lg:p-10 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
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
                  <h3 className="text-xl lg:text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed min-h-[36px]">{plan.description}</p>

                  {/* Price Display */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-3xl lg:text-4xl font-extrabold text-white">
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
                    user && activeTier === plan.id.toUpperCase()
                      ? 'bg-[#1f2d2a]/30 text-slate-500 border border-[#1f2d2a]/40 cursor-default'
                      : plan.popular
                        ? 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow-lg hover:shadow-[#16a34a]/30'
                        : 'bg-[#1f2d2a] hover:bg-[#2d3d37] text-white border border-[#2d3d37] hover:text-[#4ade80]'
                  }`}
                >
                  {user
                    ? activeTier === plan.id.toUpperCase()
                      ? 'Current Plan'
                      : 'Manage Plan'
                    : plan.ctaText
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-[#1f2d2a]/30 hidden md:block">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">Compare Plan Specifications</h3>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-2">Find the exact operational features right for your turf complexity.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1f2d2a] bg-[#0c1210]/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f2d2a] bg-[#111819]/50 text-xs font-bold text-[#4ade80] tracking-widest uppercase">
                <th className="p-4 sm:p-6">Feature Details</th>
                <th className="p-4 sm:p-6">Kickoff Starter</th>
                <th className="p-4 sm:p-6">Pro Turf Master</th>
                <th className="p-4 sm:p-6">Elite Arena Complex</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-[#1f2d2a]/55">
              {[
                { name: 'Turf Branch Locations', star: '1 Branch', pro: 'Up to 3 Branches', elite: 'Unlimited' },
                { name: 'Slot Schedule Engine', star: 'Manual entries', pro: 'Auto Generator', elite: 'Auto Generator + Rules' },
                { name: 'Receipt Verification', star: 'Basic (Offline)', pro: 'Secure Online Flow', elite: 'Fraud-Proof Flow' },
                { name: 'Revenue Analytics', star: 'Basic Metrics', pro: 'Daily Revenue & Peak Hours Charts', elite: 'AI Loyalty Circular Gauge & Velocity Forecasts' },
                { name: 'Integrated Bank Accounts', star: '1 Account', pro: 'Up to 3 Accounts', elite: 'Unlimited' },
                { name: 'Player Membership Plans', star: '1 Plan max', pro: 'Up to 3 Plans', elite: 'Up to 10 Plans' },
                { name: 'Platform Commissions', star: '0% Flat Rate', pro: '0% Flat Rate', elite: '0% Flat Rate' },
                { name: 'Admin Account Gate', star: 'Standard Approval', pro: 'Standard Approval', elite: 'Instant Priority Approval' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#111819]/35 text-[#d1d5db]">
                  <td className="p-3 sm:p-5 font-medium text-white">{row.name}</td>
                  <td className="p-3 sm:p-5">{row.star}</td>
                  <td className="p-3 sm:p-5 font-semibold text-[#4ade80]">{row.pro}</td>
                  <td className="p-3 sm:p-5 font-semibold text-[#4ade80]">{row.elite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-[#1f2d2a]/30">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#9ca3af]">Everything you need to know about setting up your turf with KOAS.</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#111819] border border-[#1f2d2a] rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left text-sm sm:text-base font-bold text-white hover:text-[#4ade80] transition-colors focus:outline-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#4ade80]' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-[300px] border-t border-[#1f2d2a]/60' : 'max-h-0'
                  }`}
                >
                  <p className="p-4 sm:p-6 text-xs sm:text-sm text-[#9ca3af] leading-relaxed bg-[#0c1210]/40">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <div className="bg-gradient-to-r from-[#111819] via-[#0d1512] to-[#111819] border border-[#1f2d2a] p-6 sm:p-10 lg:p-16 rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-r from-[#16a34a] via-transparent to-transparent pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight">
            Ready to Streamline Your Stadium Business?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-[#9ca3af] max-w-xl mx-auto leading-relaxed">
            Start your 14-day free trial today with instant access to all Elite features. Set up your turf under 5 minutes, cancel anytime.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {user ? (
              <Link to="/dashboard" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm sm:text-base font-bold rounded-lg shadow-lg shadow-[#16a34a]/30 hover:shadow-xl transition-all no-underline text-center">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm sm:text-base font-bold rounded-lg shadow-lg shadow-[#16a34a]/30 hover:shadow-xl transition-all no-underline text-center">
                Claim 14-Day Free Trial
              </Link>
            )}
            <div className="relative" ref={contactRef}>
              <button
                onClick={(e) => { e.preventDefault(); setContactOpen(!contactOpen); }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#1f2d2a] hover:bg-[#2d3d37] text-white text-sm sm:text-base font-bold rounded-lg transition-all border border-[#2d3d37] no-underline text-center cursor-pointer flex items-center justify-center gap-2"
              >
                Contact Sales Support
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${contactOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {contactOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-[#111819] border border-[#1f2d2a] rounded-xl shadow-2xl overflow-hidden z-50">
                  <a
                    href="mailto:koasmeda21@gmail.com"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/50 transition-colors no-underline border-b border-[#1f2d2a]/60"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4ade80] flex-shrink-0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold text-white">By Email</div>
                      <div className="text-[11px] text-[#9ca3af] mt-0.5">koasmeda21@gmail.com</div>
                    </div>
                  </a>
                  <a
                    href="tel:0981559200"
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[#d1d5db] hover:text-[#4ade80] hover:bg-[#1f2d2a]/50 transition-colors no-underline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4ade80] flex-shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold text-white">By Phone</div>
                      <div className="text-[11px] text-[#9ca3af] mt-0.5">0981559200</div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1.5 text-xs text-[#4ade80] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-center">Cancel at any time. Fully encrypted 256-bit transactions.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
