import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingInsight, OwnerStats, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getActiveTier } from '../../utils/tier';

interface Props {
  insights: BookingInsight[];
  stats: OwnerStats | null;
  bookings: Booking[];
}

export default function BookingInsights({ insights, stats, bookings }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const activeTier = getActiveTier(user);
  
  // Chart Mode Toggle: 'count' | 'revenue'
  const [chartMode, setChartMode] = useState<'count' | 'revenue'>('count');
  const [showStarterLockAlert, setShowStarterLockAlert] = useState(false);

  // Starter Limit Restrictions
  const isStarter = activeTier === 'STARTER';
  const isElite = activeTier === 'ELITE';

  // Toggle switcher handler
  const handleModeChange = (mode: 'count' | 'revenue') => {
    if (isStarter && mode === 'revenue') {
      setShowStarterLockAlert(true);
      setTimeout(() => setShowStarterLockAlert(false), 4000);
      return;
    }
    setChartMode(mode);
  };

  // Helper: Get Daily Revenue from real bookings array
  const getDailyRevenue = (dateStr: string) => {
    return bookings
      .filter(b => {
        const bDate = new Date(b.slot.startTime).toISOString().split('T')[0];
        return bDate === dateStr && b.status !== 'CANCELLED' && b.payment?.status === 'PAID' && b.payment?.method !== 'SUBSCRIPTION';
      })
      .reduce((sum, b) => sum + (b.payment?.amount || b.slot.price || 0), 0);
  };

  // 1. Peak Booking Hours Calculation (PRO & ELITE)
  const peakHours = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  bookings.forEach(b => {
    if (b.status === 'CANCELLED') return;
    const hour = new Date(b.slot.startTime).getHours();
    if (hour >= 6 && hour < 12) peakHours.morning += 1;
    else if (hour >= 12 && hour < 17) peakHours.afternoon += 1;
    else if (hour >= 17 && hour < 21) peakHours.evening += 1;
    else peakHours.night += 1;
  });
  const totalSlotsCount = peakHours.morning + peakHours.afternoon + peakHours.evening + peakHours.night || 1;
  
  const getPercent = (val: number) => Math.round((val / totalSlotsCount) * 100);

  // 2. AI Customer Loyalty Rate Calculation (ELITE Only)
  const playerCounts: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.status !== 'CANCELLED' && b.player?.id) {
      playerCounts[b.player.id] = (playerCounts[b.player.id] || 0) + 1;
    }
  });
  const totalPlayers = Object.keys(playerCounts).length;
  const repeatPlayers = Object.values(playerCounts).filter(c => c > 1).length;
  const loyaltyRate = totalPlayers > 0 ? Math.round((repeatPlayers / totalPlayers) * 100) : 0;

  // 3. AI Booking Velocity & Next Week Revenue Forecast Calculation (ELITE Only)
  const confirmedPaidBookings = bookings.filter(b => b.status !== 'CANCELLED');
  const distinctDaysWithBookings = new Set(
    confirmedPaidBookings.map(b => new Date(b.slot.startTime).toISOString().split('T')[0])
  ).size || 1;
  
  const dailyAverageRevenue = (stats?.revenue || 0) / distinctDaysWithBookings;
  // Dynamic velocity based on bookings ratio
  const velocityScore = Math.min(Math.round((confirmedPaidBookings.length / (bookings.length || 1)) * 100), 100);
  const velocityMultiplier = velocityScore > 75 ? 1.25 : velocityScore > 40 ? 1.05 : 0.85;
  const nextWeekForecastedRevenue = Math.round(dailyAverageRevenue * 7 * velocityMultiplier);

  // Navigation to subscription plans
  const handleUpgradeRedirect = () => {
    navigate('/subscription-plans');
  };

  return (
    <div className="relative overflow-hidden bg-white border border-[var(--color-border)] rounded-[24px] p-6 shadow-sm">
      {/* Background Decorative Ambient Radial Glow - soft light theme tint */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#16a34a]/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#10b981]/5 blur-[80px] pointer-events-none" />

      {/* ─── Header & Switch Toggles ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-xl text-[#16a34a] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-base)] tracking-tight">Booking Insights</h3>
            <p className="text-[10px] text-[#16a34a] font-bold tracking-wider uppercase mt-0.5">
              {activeTier === 'ELITE' ? '✨ Elite AI-Powered' : activeTier === 'PRO' ? '📈 Pro Advanced' : '📊 Starter Basic'}
            </p>
          </div>
        </div>

        {/* Visual Chart Toggles - Light Theme */}
        <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200/60 rounded-xl">
          <button
            onClick={() => handleModeChange('count')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartMode === 'count'
                ? 'bg-white text-[#16a34a] border border-slate-200/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => handleModeChange('revenue')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartMode === 'revenue'
                ? 'bg-white text-[#16a34a] border border-slate-200/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isStarter && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            Revenue
          </button>
        </div>
      </div>

      {/* Starter Lock Alert Prompt - Light themed warning */}
      {showStarterLockAlert && (
        <div className="absolute top-20 right-6 left-6 z-30 p-3 bg-[#fffbeb] border border-[#f59e0b]/40 rounded-xl flex items-center justify-between text-xs text-[#b45309] font-bold animate-in fade-in slide-in-from-top-4 shadow-md">
          <span className="flex items-center gap-2">
            🔒 Revenue breakdown requires a Pro or Elite subscription plan.
          </span>
          <button
            onClick={handleUpgradeRedirect}
            className="px-3 py-1 bg-[#d97706] hover:bg-[#b45309] text-white font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* ─── Bar Chart ─────────────────────────────────────────── */}
      <div className="relative h-[220px] mb-8 px-4 border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex flex-col justify-end">
        <div className="flex items-end justify-between h-[160px] gap-3 relative z-10">
          {(() => {
            if (insights.length === 0) {
              return (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
                  No booking data recorded for this week range.
                </div>
              );
            }

            const getValues = () => {
              if (chartMode === 'revenue') {
                return insights.map(item => getDailyRevenue(item.date));
              }
              return insights.map(item => item.count);
            };

            const values = getValues();
            const maxVal = Math.max(...values);
            const safeMax = maxVal || 1;

            return insights.map((item, i) => {
              const currentVal = values[i];
              const heightPercent = (currentVal / safeMax) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer">
                  {/* Bar */}
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '120px' }}>
                    {/* Hover Tooltip - Light theme */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xl whitespace-nowrap text-center">
                        <p className="text-[10px] font-extrabold text-slate-400">{item.date}</p>
                        <p className="text-xs font-black text-[#16a34a] mt-0.5">
                          {chartMode === 'revenue' ? `${currentVal.toLocaleString()} ETB` : `${currentVal} bookings`}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 mx-auto -mt-1" />
                    </div>

                    {/* Bar Fill */}
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#16a34a] to-[#34d399] relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(22,163,74,0.3)] group-hover:brightness-105"
                      style={{ height: `${heightPercent}%`, minHeight: currentVal > 0 ? '8px' : '0px' }}
                    >
                      {/* Shine Reflection animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {/* Floating Indicator inside Bar */}
                      {currentVal > 0 && heightPercent > 25 && (
                        <div className="absolute inset-x-0 top-1.5 text-center">
                          <span className="text-[10px] font-black text-white drop-shadow-sm">
                            {chartMode === 'revenue' ? `${Math.round(currentVal / 1000)}k` : currentVal}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day Label */}
                  <div className="text-center">
                    <p className="text-[10px] font-extrabold text-slate-500 group-hover:text-[#16a34a] transition-colors uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Y-Axis Grid Lines */}
        <div className="absolute inset-x-4 inset-y-8 pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-0 right-0 border-t border-dashed border-slate-200/80"
              style={{ bottom: `${(percent / 100) * 120 + 32}px` }}
            />
          ))}
        </div>
      </div>

      {/* ─── Metric Summaries ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 mb-8">
        <div className="flex items-center gap-3.5 bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Bookings</div>
            <div className="text-sm font-black text-slate-800">{stats?.paid || 0}</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0284c7]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Revenue</div>
            <div className="text-sm font-black text-slate-800">{stats?.revenue.toLocaleString() || 0} ETB</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#eab308]/10 border border-[#eab308]/20 flex items-center justify-center text-[#ca8a04]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Average Value</div>
            <div className="text-sm font-black text-slate-800">
              {stats?.paid ? Math.round(stats.revenue / stats.paid).toLocaleString() : 0} ETB
            </div>
          </div>
        </div>
      </div>

      {/* ─── Advanced Operations Analytics (Gated Segment) ────────── */}
      <div className="relative mt-8 pt-6 border-t border-slate-100">
        <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          📊 Operational Analytics
        </h4>

        {/* GRID OF ADVANCED FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Peak Booking Hours Breakdown widget (PRO & ELITE) */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 relative overflow-hidden">
            <h5 className="text-xs font-bold text-slate-700 mb-3">🌅 Peak Booking Hours</h5>
            <div className="space-y-2.5">
              {[
                { name: 'Morning (6AM-12PM)', val: peakHours.morning, pct: getPercent(peakHours.morning), color: 'bg-emerald-500' },
                { name: 'Afternoon (12PM-5PM)', val: peakHours.afternoon, pct: getPercent(peakHours.afternoon), color: 'bg-teal-500' },
                { name: 'Evening (5PM-9PM)', val: peakHours.evening, pct: getPercent(peakHours.evening), color: 'bg-[#10b981]' },
                { name: 'Late Night (9PM+)', val: peakHours.night, pct: getPercent(peakHours.night), color: 'bg-[#34d399]' }
              ].map((slot, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-500">
                    <span>{slot.name}</span>
                    <span className="text-slate-800">{slot.val} ({slot.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${slot.color} transition-all duration-500`} style={{ width: `${slot.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Starter Lock Overlay - Light themed glassmorphism */}
            {isStarter && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-1.5 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h6 className="text-[11px] font-black text-amber-800 tracking-tight uppercase">Unlock Peak Booking Hours</h6>
                <p className="text-[9px] text-slate-500 max-w-[200px] mt-0.5 leading-normal">
                  Requires Pro or Elite subscription plan to track customer slot preferences.
                </p>
                <button
                  onClick={handleUpgradeRedirect}
                  className="mt-2.5 px-3 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white text-[9px] font-black rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>

          {/* AI-Powered Loyalty & Forecast Widget (ELITE Only) */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start mb-2">
              <h5 className="text-xs font-bold text-slate-700">🔮 AI Customer & Forecast Insights</h5>
              {isElite && (
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[8px] font-black text-[#15803d] uppercase tracking-wider shadow-sm animate-pulse">
                  AI Active
                </span>
              )}
            </div>

            {/* Content for Elite Owners */}
            <div className="grid grid-cols-2 gap-3 mt-1 relative z-10">
              {/* Circular loyalty rate gauge */}
              <div className="flex flex-col items-center justify-center text-center bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 rotate-[-90deg]">
                    <circle cx="24" cy="24" r="20" className="stroke-slate-100" strokeWidth="3" fill="transparent" />
                    <circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      className="stroke-[#16a34a] transition-all duration-1000" 
                      strokeWidth="3.5" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 20} 
                      strokeDashoffset={2 * Math.PI * 20 * (1 - loyaltyRate / 100)} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-slate-800">{loyaltyRate}%</span>
                </div>
                <span className="text-[9px] font-extrabold text-slate-500 mt-2 leading-none whitespace-nowrap">Player Loyalty Rate</span>
              </div>

              {/* Forecast stats */}
              <div className="flex flex-col justify-center bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                <div className="text-[8px] font-black text-[#0284c7] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  📈 Next-Week Forecast
                </div>
                <div className="text-xs font-black text-slate-800 tracking-tight">
                  {nextWeekForecastedRevenue.toLocaleString()} ETB
                </div>
                <div className="text-[8px] text-[#16a34a] font-bold mt-1.5 flex items-center gap-0.5">
                  ⚡ Velocity: {velocityScore}%
                </div>
              </div>
            </div>

            {/* Pro & Starter Lock Overlay - Light themed glassmorphism */}
            {!isElite && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#16a34a] mb-1.5 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h6 className="text-[11px] font-black text-[#15803d] tracking-tight uppercase">Unlock Elite AI Forecasting</h6>
                <p className="text-[9px] text-slate-500 max-w-[200px] mt-0.5 leading-normal">
                  Requires Elite Arena Complex plan to activate repeat rate gauges & weekly booking forecasts.
                </p>
                <button
                  onClick={handleUpgradeRedirect}
                  className="mt-2.5 px-3 py-1 bg-[#10b981] hover:bg-[#059669] text-white text-[9px] font-extrabold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Upgrade to Elite
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
