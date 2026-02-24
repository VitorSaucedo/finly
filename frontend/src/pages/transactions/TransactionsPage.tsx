import { useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories.ts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import TransactionFormModal from "./TransactionFormModal.tsx";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import type { TransactionResponse } from "../../types/transaction";

const typeBadge = (type: string) => {
  if (type === "INCOME") return <Badge variant="success">Income</Badge>;
  if (type === "EXPENSE") return <Badge variant="danger">Expense</Badge>;
  return <Badge variant="info">Transfer</Badge>;
};

const statusBadge = (status: string) => {
  if (status === "COMPLETED") return <Badge variant="success">Completed</Badge>;
  if (status === "PENDING") return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="neutral">Cancelled</Badge>;
};

const TransactionsPage = () => {
  const { data, loading, create, update, remove } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const transactions = (data?.content ?? []).filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.accountName.toLowerCase().includes(search.toLowerCase()) ||
      (t.categoryName?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  const handleEdit = (transaction: TransactionResponse) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
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

  const columns = [
    {
      key: "description",
      header: "Description",
      render: (t: TransactionResponse) => (
        <div>
          <p className="font-medium text-gray-800 text-xs">{t.description}</p>
          <p className="text-gray-400 text-xs">{t.accountName}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (t: TransactionResponse) => (
        <span className="text-xs text-gray-600">{t.categoryName ?? "—"}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (t: TransactionResponse) => (
        <span className="text-xs text-gray-600">
          {formatDate(t.transactionDate)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (t: TransactionResponse) => typeBadge(t.type),
    },
    {
      key: "status",
      header: "Status",
      render: (t: TransactionResponse) => statusBadge(t.status),
    },
    {
      key: "amount",
      header: "Amount",
      render: (t: TransactionResponse) => (
        <span
          className={`text-xs font-semibold font-mono ${
            t.type === "INCOME" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {t.type === "INCOME" ? "+" : "-"}
          {formatCurrency(t.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (t: TransactionResponse) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => handleEdit(t)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setDeletingId(t.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {data?.totalElements ?? 0} transactions total
          </p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Transaction
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>
        <Table
          columns={columns}
          data={transactions}
          loading={loading}
          keyExtractor={(t) => t.id}
          emptyMessage="No transactions found"
        />

        {/* Pagination info */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={data.first}
                onClick={() => {}}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={data.last}
                onClick={() => {}}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      <TransactionFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={async (formData) => {
          if (editingTransaction) {
            await update(editingTransaction.id, formData);
          } else {
            await create(formData);
          }
          handleCloseModal();
        }}
        accounts={accounts}
        categories={categories}
        initial={editingTransaction}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This will reverse the balance update on the account."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TransactionsPage;
