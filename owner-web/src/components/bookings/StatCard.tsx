import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  color: 'success' | 'warning' | 'danger' | 'info';
  icon: React.ReactNode;
}

export default function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  const styles = {
    success: { bg: 'bg-[var(--color-success-bg)]', text: 'text-[var(--color-success)]', border: 'border-[var(--color-success)]/20' },
    warning: { bg: 'bg-[var(--color-warning-bg)]', text: 'text-[var(--color-warning)]', border: 'border-[var(--color-warning)]/20' },
    danger: { bg: 'bg-[var(--color-danger-bg)]', text: 'text-[var(--color-danger)]', border: 'border-[var(--color-danger)]/20' },
    info: { bg: 'bg-[var(--color-info-bg)]', text: 'text-[var(--color-info)]', border: 'border-[var(--color-info)]/20' }
  };
  
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[20px] p-6 shadow-sm relative overflow-hidden group hover:border-[var(--color-border-strong)] transition-all">
      <div className="flex items-start justify-between relative z-10">
        <div>
           <div className={`w-10 h-10 rounded-xl ${styles[color].bg} ${styles[color].text} flex items-center justify-center mb-4 shadow-sm`}>
            {icon}
          </div>
          <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{label}</div>
          <div className="text-2xl font-black text-[var(--color-text-base)] tracking-tight mb-0.5">{value}</div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${styles[color].text.replace('text', 'bg')}`} />
            <span className="text-[11px] text-[var(--color-text-muted)] font-medium">{sub}</span>
          </div>
        </div>
      </div>
      {/* Subtle background decoration */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] ${styles[color].text.replace('text', 'bg')} transition-all group-hover:scale-110`} />
    </div>
  );
}
