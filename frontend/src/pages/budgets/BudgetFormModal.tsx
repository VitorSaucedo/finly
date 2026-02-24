import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type { BudgetRequest, BudgetResponse } from "../../types/budget";
import type { CategoryResponse } from "../../types/category";

const schema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetRequest) => Promise<void>;
  categories: CategoryResponse[];
  initial?: BudgetResponse | null;
  defaultMonth: number;
  defaultYear: number;
}

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const BudgetFormModal = ({
  open,
  onClose,
  onSubmit,
  categories,
  initial,
  defaultMonth,
  defaultYear,
}: Props) => {
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: String(defaultMonth),
      year: String(defaultYear),
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        categoryId: initial.categoryId,
        amount: String(initial.amount),
        month: String(initial.month),
        year: String(initial.year),
      });
    } else {
      reset({
        month: String(defaultMonth),
        year: String(defaultYear),
      });
    }
  }, [initial, reset, open, defaultMonth, defaultYear]);

  const expenseCategories = categories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({ value: c.id, label: c.name }));

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      categoryId: data.categoryId,
      amount: parseFloat(data.amount),
      month: parseInt(data.month),
      year: parseInt(data.year),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Budget" : "New Budget"}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Category"
          options={expenseCategories}
          placeholder="Select category"
          error={errors.categoryId?.message}
          {...register("categoryId")}
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Month"
            options={monthOptions}
            error={errors.month?.message}
            {...register("month")}
          />
          <Input
            label="Year"
            type="number"
            min="2000"
            placeholder={String(defaultYear)}
            error={errors.year?.message}
            {...register("year")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Budget"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetFormModal;
