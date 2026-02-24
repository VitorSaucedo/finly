import { useState } from "react";
import { Plus, Trash2, Pencil, Wallet } from "lucide-react";
import { useAccounts } from "../../hooks/useAccounts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import AccountFormModal from "./AccountFormModal.tsx";
import { formatCurrency } from "../../utils/formatCurrency";
import type { AccountResponse } from "../../types/account";

const accountTypeLabel: Record<string, string> = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  WALLET: "Wallet",
  CREDIT_CARD: "Credit Card",
  INVESTMENT: "Investment",
};

const accountTypeBadge = (type: string) => {
  const variants: Record<
    string,
    "success" | "info" | "neutral" | "warning" | "danger"
  > = {
    CHECKING: "success",
    SAVINGS: "info",
    WALLET: "neutral",
    CREDIT_CARD: "warning",
    INVESTMENT: "info",
  };
  return (
    <Badge variant={variants[type] ?? "neutral"}>
      {accountTypeLabel[type] ?? type}
    </Badge>
  );
};

const AccountsPage = () => {
  const { accounts, loading, create, update, remove } = useAccounts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountResponse | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (account: AccountResponse) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      await remove(deletingId);
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{accounts.length} accounts</p>
        <Button icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Account
        </Button>
      </div>

      {/* Total balance card */}
      <Card className="bg-gray-950 border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Balance</p>
            <p className="text-2xl font-semibold text-white font-mono mt-1">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl">
            <Wallet className="text-emerald-400 w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </p>
      </Card>

      {/* Accounts grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="text-center py-12">
          <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No accounts yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Create your first account to get started
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => handleEdit(account)}
              onDelete={() => setDeletingId(account.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AccountFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={async (data) => {
          if (editingAccount) {
            await update(editingAccount.id, data);
          } else {
            await create(data);
          }
          handleCloseModal();
        }}
        initial={editingAccount}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? All associated transactions will also be deleted."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

const AccountCard = ({
  account,
  onEdit,
  onDelete,
}: {
  account: AccountResponse;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      {accountTypeBadge(account.type)}
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
    <p className="text-sm font-semibold text-gray-800 mb-1">{account.name}</p>
    <p className="text-xl font-semibold text-gray-900 font-mono">
      {formatCurrency(account.balance, account.currency)}
    </p>
    <p className="text-xs text-gray-400 mt-2">{account.currency}</p>
  </Card>
);

export default AccountsPage;
