import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type { AccountRequest, AccountResponse } from "../../types/account";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["CHECKING", "SAVINGS", "WALLET", "CREDIT_CARD", "INVESTMENT"]),
  balance: z.string().min(1, "Balance is required"),
  currency: z.string().length(3, "Currency must be 3 characters"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccountRequest) => Promise<void>;
  initial?: AccountResponse | null;
}

const AccountFormModal = ({ open, onClose, onSubmit, initial }: Props) => {
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "BRL" },
  });

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        type: initial.type,
        balance: String(initial.balance),
        currency: initial.currency,
      });
    } else {
      reset({ currency: "BRL" });
    }
  }, [initial, reset, open]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      name: data.name,
      type: data.type,
      balance: parseFloat(data.balance),
      currency: data.currency.toUpperCase(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Account" : "New Account"}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Nubank"
          error={errors.name?.message}
          {...register("name")}
        />

        <Select
          label="Type"
          options={[
            { value: "CHECKING", label: "Checking" },
            { value: "SAVINGS", label: "Savings" },
            { value: "WALLET", label: "Wallet" },
            { value: "CREDIT_CARD", label: "Credit Card" },
            { value: "INVESTMENT", label: "Investment" },
          ]}
          placeholder="Select type"
          error={errors.type?.message}
          {...register("type")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Initial Balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.balance?.message}
            {...register("balance")}
          />
          <Input
            label="Currency"
            placeholder="BRL"
            maxLength={3}
            error={errors.currency?.message}
            {...register("currency")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AccountFormModal;
