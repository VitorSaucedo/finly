import { useState } from "react";
import { Plus, Trash2, Pencil, PiggyBank } from "lucide-react";
import { useBudgets } from "../../hooks/useBudgets";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import BudgetFormModal from "./BudgetFormModal.tsx";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatMonth } from "../../utils/formatDate";
import { useCategories } from "../../hooks/useCategories.ts";
import type { BudgetResponse } from "../../types/budget";

const statusBadge = (status: string) => {
  if (status === "EXCEEDED") return <Badge variant="danger">Exceeded</Badge>;
  if (status === "COMPLETED") return <Badge variant="success">Completed</Badge>;
  return <Badge variant="success">Active</Badge>;
};

const BudgetsPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { budgets, loading, create, update, remove } = useBudgets(month, year);
  const { categories } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetResponse | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (budget: BudgetResponse) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBudget(null);
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

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-32 text-center">
            {formatMonth(month, year)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ›
          </button>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Budget
        </Button>
      </div>

      {/* Summary card */}
      {budgets.length > 0 && (
        <Card className="bg-gray-950 border-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400">Total Spent</p>
              <p className="text-2xl font-semibold text-white font-mono mt-1">
                {formatCurrency(totalSpent)}
                <span className="text-sm text-gray-400 font-normal ml-2">
                  of {formatCurrency(totalBudget)}
                </span>
              </p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <PiggyBank className="text-emerald-400 w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                overallPercentage >= 100
                  ? "bg-red-500"
                  : overallPercentage >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {overallPercentage.toFixed(0)}% of total budget used
          </p>
        </Card>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-2 bg-gray-100 rounded" />
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="text-center py-12">
          <PiggyBank className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No budgets for this month</p>
          <p className="text-xs text-gray-300 mt-1">
            Create budgets to control your spending
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEdit(budget)}
              onDelete={() => setDeletingId(budget.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <BudgetFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={async (data) => {
          if (editingBudget) {
            await update(editingBudget.id, data);
          } else {
            await create(data);
          }
          handleCloseModal();
        }}
        categories={categories}
        initial={editingBudget}
        defaultMonth={month}
        defaultYear={year}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget?"
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

const BudgetCard = ({
  budget: b,
  onEdit,
  onDelete,
}: {
  budget: BudgetResponse;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: b.categoryColor || "#10b981" }}
        />
        <p className="text-sm font-semibold text-gray-800">{b.categoryName}</p>
      </div>
      <div className="flex items-center gap-1">
        {statusBadge(b.status)}
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>

    <div className="mb-3">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-gray-400">Spent</span>
        <span className="text-xs text-gray-400 font-mono">
          {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            b.status === "EXCEEDED"
              ? "bg-red-500"
              : b.percentageUsed > 80
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
        />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">
        Remaining:{" "}
        <span
          className={`font-semibold font-mono ${b.remaining < 0 ? "text-red-500" : "text-gray-700"}`}
        >
          {formatCurrency(b.remaining)}
        </span>
      </span>
      <span className="text-xs text-gray-400">
        {b.percentageUsed.toFixed(0)}%
      </span>
    </div>
  </Card>
);

export default BudgetsPage;
