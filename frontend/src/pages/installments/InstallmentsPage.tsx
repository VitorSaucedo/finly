import { useState } from "react";
import {
  Plus,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useInstallments } from "../../hooks/useInstallments";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories.ts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import InstallmentFormModal from "./InstallmentFormModal.tsx";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import type {
  InstallmentGroupResponse,
  InstallmentResponse,
} from "../../types/installment";

const statusBadge = (status: string) => {
  if (status === "COMPLETED") return <Badge variant="success">Paid</Badge>;
  if (status === "CANCELLED") return <Badge variant="neutral">Cancelled</Badge>;
  return <Badge variant="warning">Pending</Badge>;
};

const InstallmentsPage = () => {
  const { data, loading, create, pay, cancel } = useInstallments();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const handlePay = async (installmentId: string) => {
    try {
      setPayingId(installmentId);
      await pay(installmentId);
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancellingId) return;
    try {
      setCancelLoading(true);
      await cancel(cancellingId);
      setCancellingId(null);
    } finally {
      setCancelLoading(false);
    }
  };

  const groups = data?.content ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {groups.length} installment plans
        </p>
        <Button icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Installment
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="text-center py-12">
          <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No installment plans yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Create a plan to track your installment payments
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <InstallmentGroupCard
              key={group.id}
              group={group}
              expanded={expandedId === group.id}
              onToggle={() =>
                setExpandedId(expandedId === group.id ? null : group.id)
              }
              onPay={handlePay}
              onCancel={() => setCancellingId(group.id)}
              payingId={payingId}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <InstallmentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (formData) => {
          await create(formData);
          setModalOpen(false);
        }}
        accounts={accounts}
        categories={categories}
      />

      {/* Confirm cancel */}
      <ConfirmDialog
        open={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancel}
        title="Cancel Installment Plan"
        message="Are you sure you want to cancel all pending installments in this plan?"
        confirmLabel="Cancel Plan"
        loading={cancelLoading}
      />
    </div>
  );
};

const InstallmentGroupCard = ({
  group,
  expanded,
  onToggle,
  onPay,
  onCancel,
  payingId,
}: {
  group: InstallmentGroupResponse;
  expanded: boolean;
  onToggle: () => void;
  onPay: (id: string) => void;
  onCancel: () => void;
  payingId: string | null;
}) => {
  const progress = (group.paidCount / group.installmentCount) * 100;
  const hasPending = group.installments.some((i) => i.status === "PENDING");

  return (
    <Card>
      {/* Group header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-800">
              {group.description}
            </p>
            {!hasPending && <Badge variant="success">Completed</Badge>}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{group.accountName}</span>
            {group.categoryName && <span>· {group.categoryName}</span>}
            <span>· Started {formatDate(group.startDate)}</span>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-sm font-semibold text-gray-900 font-mono">
            {formatCurrency(group.totalAmount)}
          </p>
          <p className="text-xs text-gray-400">
            {group.paidCount}/{group.installmentCount} paid
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 mb-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Hide" : "Show"} installments
        </button>
        {hasPending && (
          <button
            onClick={onCancel}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Cancel plan
          </button>
        )}
      </div>

      {/* Installments list */}
      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
          {group.installments.map((installment) => (
            <InstallmentRow
              key={installment.id}
              installment={installment}
              installmentCount={group.installmentCount}
              onPay={onPay}
              paying={payingId === installment.id}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const InstallmentRow = ({
  installment: i,
  installmentCount,
  onPay,
  paying,
}: {
  installment: InstallmentResponse;
  installmentCount: number;
  onPay: (id: string) => void;
  paying: boolean;
}) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
    <div className="flex items-center gap-3">
      <div
        className={`shrink-0 ${
          i.status === "COMPLETED"
            ? "text-emerald-500"
            : i.status === "CANCELLED"
              ? "text-gray-300"
              : "text-gray-300"
        }`}
      >
        {i.status === "COMPLETED" ? (
          <CheckCircle size={15} />
        ) : (
          <XCircle size={15} />
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-700">
          Installment {i.installmentNumber}/{installmentCount}
        </p>
        <p className="text-xs text-gray-400">Due {formatDate(i.dueDate)}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-gray-700 font-mono">
        {formatCurrency(i.amount)}
      </span>
      {statusBadge(i.status)}
      {i.status === "PENDING" && (
        <Button size="sm" onClick={() => onPay(i.id)} loading={paying}>
          Pay
        </Button>
      )}
    </div>
  </div>
);

export default InstallmentsPage;
