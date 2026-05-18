import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import BankAccountCard from '../components/bank/BankAccountCard';
import BankAccountModal from '../components/bank/BankAccountModal';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function BankDetailsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const res = await api.get('/bank-accounts/my');
      setAccounts(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load bank accounts.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (accounts.length >= 5) {
      setError('Maximum of 5 bank accounts allowed.');
      return;
    }
    setEditingAccount(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    setActionLoading(id);
    try {
      await api.delete(`/bank-accounts/${id}`);
      setSuccess('Bank account deleted successfully!');
      fetchBankAccounts();
    } catch (err) {
      setError(getApiError(err, 'Failed to delete bank account.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/bank-accounts/${id}/set-default`);
      setSuccess('Default bank account updated!');
      fetchBankAccounts();
    } catch (err) {
      setError(getApiError(err, 'Failed to set default account.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingAccount(null);
    setSuccess(editingAccount ? 'Bank account updated successfully!' : 'Bank account added successfully!');
    fetchBankAccounts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16">
        <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-[var(--color-text-muted)] text-sm">Loading bank accounts…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
            Bank Account Details
          </h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Manage your bank accounts for receiving payments from players.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={accounts.length >= 5}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Bank Account
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 mb-6 rounded-[10px] bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="text-[0.8125rem] leading-relaxed">
          <p className="font-bold mb-1">Payment Information</p>
          <p className="text-[#1e40af]/80">
            You can add up to 5 bank accounts. Players will see your default account when making payments. {accounts.length}/5 accounts added.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-sm font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] text-sm font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {success}
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">💳</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">
            No bank accounts added
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-4">
            Add your bank account details so players can transfer payments to you.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Your First Account
          </button>
        </div>
      )}

      {/* Bank Accounts List */}
      {accounts.length > 0 && (
        <div className="flex flex-col gap-3">
          {accounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              busy={actionLoading === account.id}
              onEdit={() => handleEdit(account)}
              onDelete={() => handleDelete(account.id)}
              onSetDefault={() => handleSetDefault(account.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <BankAccountModal
          account={editingAccount}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

export type { BankAccount };
