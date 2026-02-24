import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "../../utils/formatCurrency";
import type { GoalResponse } from "../../types/goal";

const schema = z.object({
  amount: z.string().min(1, "Amount is required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  goal: GoalResponse | null;
}

const DepositModal = ({ open, onClose, onSubmit, goal }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(parseFloat(data.amount));
  };

  return (
    <Modal open={open} onClose={onClose} title="Deposit to Goal" size="sm">
      {goal && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs text-gray-400">Goal</p>
          <p className="text-sm font-semibold text-gray-800">{goal.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(goal.currentAmount)} of{" "}
            {formatCurrency(goal.targetAmount)} saved (
            {goal.percentageCompleted.toFixed(0)}%)
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Amount to deposit"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepositModal;
