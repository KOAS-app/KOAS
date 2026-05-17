import type { Booking } from '../../types';

export function StatusBadge({ status }: { status: Booking['status'] }) {
  const styles = {
    PENDING: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
    CONFIRMED: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20',
    CANCELLED: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border tracking-wider uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

export function PaymentBadge({ status }: { status?: NonNullable<Booking['payment']>['status'] }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    PENDING: 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]',
    RECEIPT_SUBMITTED: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/20',
    PAID: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20',
    REJECTED: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
    DISPUTED: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
  };
  
  const labels: Record<string, string> = {
    PENDING: 'Awaiting Payment',
    RECEIPT_SUBMITTED: 'Review Receipt',
    PAID: 'Paid',
    REJECTED: 'Payment Rejected',
    DISPUTED: 'Payment Disputed'
  };

  const currentStyle = styles[status] || styles.PENDING;
  const textColorClass = currentStyle.split(' ').find(c => c.startsWith('text-')) || 'text-[var(--color-text-muted)]';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${textColorClass.replace('text', 'bg')}`} />
      <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">
        {labels[status] || status}
      </span>
    </div>
  );
}
