import { useState } from "react";
import { Plus, Trash2, Pencil, Target, PlusCircle } from "lucide-react";
import { useGoals } from "../../hooks/useGoals";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import GoalFormModal from "./GoalFormModal.tsx";
import DepositModal from "./DepositModal.tsx";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import type { GoalResponse } from "../../types/goal";

const statusBadge = (status: string) => {
  if (status === "COMPLETED") return <Badge variant="success">Completed</Badge>;
  if (status === "CANCELLED") return <Badge variant="neutral">Cancelled</Badge>;
  return <Badge variant="info">In Progress</Badge>;
};

const GoalsPage = () => {
  const { goals, loading, create, update, deposit, remove } = useGoals();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalResponse | null>(null);
  const [depositGoal, setDepositGoal] = useState<GoalResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (goal: GoalResponse) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
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

  const inProgress = goals.filter((g) => g.status === "IN_PROGRESS");
  const completed = goals.filter((g) => g.status === "COMPLETED");
  const cancelled = goals.filter((g) => g.status === "CANCELLED");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{goals.length} goals total</p>
        <Button icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Goal
        </Button>
      </div>

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
      ) : goals.length === 0 ? (
        <Card className="text-center py-12">
          <Target className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No goals yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Set financial goals to track your progress
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                In Progress ({inProgress.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {inProgress.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => setDeletingId(goal.id)}
                    onDeposit={() => setDepositGoal(goal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Completed ({completed.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {completed.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => setDeletingId(goal.id)}
                    onDeposit={() => setDepositGoal(goal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled */}
          {cancelled.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Cancelled ({cancelled.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {cancelled.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => setDeletingId(goal.id)}
                    onDeposit={() => setDepositGoal(goal)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal form modal */}
      <GoalFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={async (data) => {
          if (editingGoal) {
            await update(editingGoal.id, data);
          } else {
            await create(data);
          }
          handleCloseModal();
        }}
        initial={editingGoal}
      />

      {/* Deposit modal */}
      <DepositModal
        open={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        onSubmit={async (amount) => {
          if (depositGoal) {
            await deposit(depositGoal.id, amount);
            setDepositGoal(null);
          }
        }}
        goal={depositGoal}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

const GoalCard = ({
  goal: g,
  onEdit,
  onDelete,
  onDeposit,
}: {
  goal: GoalResponse;
  onEdit: () => void;
  onDelete: () => void;
  onDeposit: () => void;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 mr-2">
        <p className="text-sm font-semibold text-gray-800 truncate">{g.name}</p>
        {g.deadline && (
          <p className="text-xs text-gray-400 mt-0.5">
            Due {formatDate(g.deadline)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {statusBadge(g.status)}
        {!g.status.includes("CANCELLED") && (
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1"
          >
            <Pencil size={12} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>

    {/* Progress */}
    <div className="mb-3">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-gray-400">Progress</span>
        <span className="text-xs font-semibold text-gray-700">
          {g.percentageCompleted.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            g.status === "COMPLETED" ? "bg-emerald-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(g.percentageCompleted, 100)}%` }}
        />
      </div>
    </div>

    {/* Amounts */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs text-gray-400">Saved</p>
        <p className="text-sm font-semibold text-gray-900 font-mono">
          {formatCurrency(g.currentAmount)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400">Target</p>
        <p className="text-sm font-semibold text-gray-900 font-mono">
          {formatCurrency(g.targetAmount)}
        </p>
      </div>
    </div>

    {/* Remaining + deposit button */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">
        Remaining:{" "}
        <span className="font-semibold text-gray-700 font-mono">
          {formatCurrency(Math.max(g.remainingAmount, 0))}
        </span>
      </span>
      {g.status === "IN_PROGRESS" && (
        <button
          onClick={onDeposit}
          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <PlusCircle size={13} />
          Deposit
        </button>
      )}
    </div>
  </Card>
);

export default GoalsPage;
