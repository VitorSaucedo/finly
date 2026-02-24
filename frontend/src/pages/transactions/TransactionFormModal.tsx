import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type {
  TransactionRequest,
  TransactionResponse,
} from "../../types/transaction";
import type { AccountResponse } from "../../types/account";
import type { CategoryResponse } from "../../types/category";

const schema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  description: z.string().min(1, "Description is required").max(255),
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
  transactionDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionRequest) => Promise<void>;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  initial?: TransactionResponse | null;
}

const TransactionFormModal = ({
  open,
  onClose,
  onSubmit,
  accounts,
  categories,
  initial,
}: Props) => {
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "COMPLETED",
      transactionDate: new Date().toISOString().split("T")[0],
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (initial) {
      reset({
        accountId: initial.accountId,
        categoryId: initial.categoryId ?? "",
        destinationAccountId: initial.destinationAccountId ?? "",
        description: initial.description,
        amount: String(initial.amount),
        type: initial.type,
        status: initial.status,
        transactionDate: initial.transactionDate,
        notes: initial.notes ?? "",
      });
    } else {
      reset({
        status: "COMPLETED",
        transactionDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [initial, reset, open]);

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.currency})`,
  }));
  const categoryOptions = categories
    .filter((c) =>
      type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE",
    )
    .map((c) => ({ value: c.id, label: c.name }));

  const handleFormSubmit = async (data: FormData) => {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) return;

    await onSubmit({
      accountId: data.accountId,
      categoryId: data.categoryId || undefined,
      destinationAccountId: data.destinationAccountId || undefined,
      description: data.description,
      amount,
      type: data.type,
      status: data.status,
      transactionDate: data.transactionDate,
      notes: data.notes || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "New Transaction"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Type"
          options={[
            { value: "INCOME", label: "Income" },
            { value: "EXPENSE", label: "Expense" },
            { value: "TRANSFER", label: "Transfer" },
          ]}
          placeholder="Select type"
          error={errors.type?.message}
          {...register("type")}
        />

        <Input
          label="Description"
          placeholder="e.g. Monthly salary"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Input
            label="Date"
            type="date"
            error={errors.transactionDate?.message}
            {...register("transactionDate")}
          />
        </div>

        <Select
          label="Account"
          options={accountOptions}
          placeholder="Select account"
          error={errors.accountId?.message}
          {...register("accountId")}
        />

        {type === "TRANSFER" && (
          <Select
            label="Destination Account"
            options={accountOptions}
            placeholder="Select destination"
            error={errors.destinationAccountId?.message}
            {...register("destinationAccountId")}
          />
        )}

        {type !== "TRANSFER" && (
          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select category (optional)"
            {...register("categoryId")}
          />
        )}

        <Select
          label="Status"
          options={[
            { value: "COMPLETED", label: "Completed" },
            { value: "PENDING", label: "Pending" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
          error={errors.status?.message}
          {...register("status")}
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
            {isEditing ? "Save Changes" : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;
