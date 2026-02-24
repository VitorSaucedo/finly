import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type { InstallmentRequest } from "../../types/installment";
import type { AccountResponse } from "../../types/account";
import type { CategoryResponse } from "../../types/category";

const schema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required").max(255),
  totalAmount: z.string().min(1, "Total amount is required"),
  installmentCount: z.string().min(1, "Installment count is required"),
  startDate: z.string().min(1, "Start date is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InstallmentRequest) => Promise<void>;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
}

const InstallmentFormModal = ({
  open,
  onClose,
  onSubmit,
  accounts,
  categories,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (!open) reset({ startDate: new Date().toISOString().split("T")[0] });
  }, [open, reset]);

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));
  const categoryOptions = categories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({ value: c.id, label: c.name }));

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      accountId: data.accountId,
      categoryId: data.categoryId || undefined,
      description: data.description,
      totalAmount: parseFloat(data.totalAmount),
      installmentCount: parseInt(data.installmentCount),
      startDate: data.startDate,
      notes: data.notes || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="New Installment Plan" size="sm">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Description"
          placeholder="e.g. MacBook Pro"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.totalAmount?.message}
            {...register("totalAmount")}
          />
          <Input
            label="Installments"
            type="number"
            min="2"
            max="360"
            placeholder="12"
            error={errors.installmentCount?.message}
            {...register("installmentCount")}
          />
        </div>

        <Input
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />

        <Select
          label="Account"
          options={accountOptions}
          placeholder="Select account"
          error={errors.accountId?.message}
          {...register("accountId")}
        />

        <Select
          label="Category"
          options={categoryOptions}
          placeholder="Select category (optional)"
          {...register("categoryId")}
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
            Create Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InstallmentFormModal;
