import type { BankAccount } from '../../pages/BankDetailsPage';

interface Props {
  account: BankAccount;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export default function BankAccountCard({ account, busy, onEdit, onDelete, onSetDefault }: Props) {
  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-extrabold text-[var(--color-text-base)] tracking-tight">
                {account.bankName}
              </h3>
              {account.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-bold tracking-wide bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                  DEFAULT
                </span>
              )}
            </div>
            <p className="text-[0.9375rem] font-semibold text-[var(--color-text-secondary)] mb-1">
              {account.accountNumber}
            </p>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)]">
              {account.accountHolderName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              disabled={busy}
              className="w-9 h-9 rounded-lg border border-[var(--color-border)] bg-transparent flex items-center justify-center text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-base)] disabled:opacity-50"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              className="w-9 h-9 rounded-lg border border-[var(--color-border)] bg-transparent flex items-center justify-center text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] hover:border-[#fecaca] disabled:opacity-50"
              title="Delete"
            >
              {busy ? (
                <div className="w-3.5 h-3.5 border-[1.5px] border-[var(--color-text-muted)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {!account.isDefault && (
          <button
            onClick={onSetDefault}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.8125rem] font-semibold text-[var(--color-primary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Set as Default
          </button>
        )}
      </div>
    </div>
  );
}
