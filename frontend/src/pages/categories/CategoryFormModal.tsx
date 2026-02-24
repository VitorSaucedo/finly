import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type { CategoryRequest, CategoryResponse } from "../../types/category";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  initial?: CategoryResponse | null;
}

const PRESET_COLORS = [
  "#10b981",
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#e879f9",
];

const CategoryFormModal = ({ open, onClose, onSubmit, initial }: Props) => {
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: "#10b981" },
  });

  const selectedColor = watch("color");

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        type: initial.type,
        color: initial.color || "#10b981",
        icon: initial.icon || "",
      });
    } else {
      reset({ color: "#10b981" });
    }
  }, [initial, reset, open]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      name: data.name,
      type: data.type,
      color: data.color || "#10b981",
      icon: data.icon || "",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "New Category"}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Food & Drinks"
          error={errors.name?.message}
          {...register("name")}
        />

        <Select
          label="Type"
          options={[
            { value: "INCOME", label: "Income" },
            { value: "EXPENSE", label: "Expense" },
          ]}
          placeholder="Select type"
          error={errors.type?.message}
          {...register("type")}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue("color", color)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? "border-gray-800 scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={selectedColor || "#10b981"}
              onChange={(e) => setValue("color", e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer border border-gray-200"
              title="Custom color"
            />
          </div>
          {errors.color && (
            <p className="text-xs text-red-500 mt-1">{errors.color.message}</p>
          )}
        </div>

        <Input
          label="Icon"
          placeholder="e.g. utensils (optional)"
          {...register("icon")}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
