import { Activity } from '../../types';

interface Props {
  activities: Activity[];
  fmtDate: (iso: string) => string;
  timeAgo: (iso: string) => string;
}

export default function RecentActivity({ activities, fmtDate, timeAgo }: Props) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[20px] p-6 shadow-sm">
      <h3 className="text-lg font-black text-[var(--color-text-base)] mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-10">No recent activity.</p>
        ) : (
          activities.map((act, i) => (
            <div key={act.id} className="flex gap-3.5 relative">
              {i !== activities.length - 1 && (
                <div className="absolute left-4.5 top-9 bottom-[-24px] w-0.5 bg-[var(--color-border)]/50" />
              )}
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
                act.type === 'BOOKING_CREATED' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
              }`}>
                {act.type === 'BOOKING_CREATED' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--color-text-base)] leading-tight mb-0.5">
                  {act.type === 'BOOKING_CREATED' ? `New booking by ${act.playerName}` : `Payment received from ${act.playerName}`}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] truncate mb-1">
                  {act.location} • {fmtDate(act.bookingTime)}
                </div>
                <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">
                  {timeAgo(act.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
