import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import type { GoalRequest, GoalResponse } from "../../types/goal";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GoalRequest) => Promise<void>;
  initial?: GoalResponse | null;
}

const GoalFormModal = ({ open, onClose, onSubmit, initial }: Props) => {
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        targetAmount: String(initial.targetAmount),
        currentAmount: String(initial.currentAmount),
        deadline: initial.deadline ?? "",
        notes: initial.notes ?? "",
      });
    } else {
      reset({});
    }
  }, [initial, reset, open]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      name: data.name,
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: data.currentAmount
        ? parseFloat(data.currentAmount)
        : undefined,
      deadline: data.deadline || undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Goal" : "New Goal"}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Emergency Fund"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.targetAmount?.message}
            {...register("targetAmount")}
          />
          <Input
            label="Current Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            hint="Optional initial value"
            {...register("currentAmount")}
          />
        </div>

        <Input
          label="Deadline"
          type="date"
          hint="Optional"
          {...register("deadline")}
        />

        <Input
          label="Notes"
          placeholder="Optional notes..."
          {...register("notes")}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalFormModal;
