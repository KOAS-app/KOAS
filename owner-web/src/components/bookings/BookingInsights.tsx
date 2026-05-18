import { BookingInsight, OwnerStats } from '../../types';

interface Props {
  insights: BookingInsight[];
  stats: OwnerStats | null;
}

export default function BookingInsights({ insights, stats }: Props) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[20px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[var(--color-primary-bg)] rounded-lg text-[var(--color-primary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-[var(--color-text-base)]">Booking Insights</h3>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative h-[200px] mb-6 px-4">
        <div className="flex items-end justify-between h-full gap-3">
          {(() => {
            if (insights.length === 0) return null;
            
            const maxCount = Math.max(...insights.map(x => x.count));
            const safeMax = maxCount || 1;
            
            return insights.map((item, i) => {
              const heightPercent = (item.count / safeMax) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                  {/* Bar */}
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '160px' }}>
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="px-3 py-1.5 rounded-lg bg-[var(--color-text-base)] shadow-lg whitespace-nowrap">
                        <p className="text-xs font-bold text-white">{item.count} bookings</p>
                      </div>
                      <div className="w-2 h-2 bg-[var(--color-text-base)] rotate-45 mx-auto -mt-1"></div>
                    </div>
                    
                    {/* Bar Container */}
                    <div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary)]/70 relative overflow-hidden transition-all duration-300 group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-primary)]"
                      style={{ height: `${heightPercent}%`, minHeight: item.count > 0 ? '8px' : '0px' }}
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      {/* Value Label */}
                      {item.count > 0 && (
                        <div className="absolute inset-x-0 top-2 text-center">
                          <span className="text-xs font-black text-white drop-shadow-sm">
                            {item.count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="text-center">
                    <p className="text-[0.6875rem] font-extrabold text-[var(--color-text-base)] group-hover:text-[var(--color-primary)] transition-colors">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
        
        {/* Y-Axis Grid Lines */}
        <div className="absolute inset-0 pointer-events-none px-4">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-4 right-4 border-t border-dashed border-[var(--color-border)] opacity-20"
              style={{ bottom: `${(percent / 100) * 160 + 40}px` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)]">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-bg)] flex items-center justify-center text-[var(--color-primary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div>
               <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Total Bookings</div>
               <div className="text-sm font-black text-[var(--color-text-base)]">{stats?.paid || 0}</div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-info-bg)] flex items-center justify-center text-[var(--color-info)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
               <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Total Revenue</div>
               <div className="text-sm font-black text-[var(--color-text-base)]">{stats?.revenue.toLocaleString()} ETB</div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-bg)] flex items-center justify-center text-[var(--color-warning)]">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
               </svg>
            </div>
            <div>
               <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Avg. Value</div>
               <div className="text-sm font-black text-[var(--color-text-base)]">
                {stats?.paid ? Math.round(stats.revenue / stats.paid).toLocaleString() : 0} ETB
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
