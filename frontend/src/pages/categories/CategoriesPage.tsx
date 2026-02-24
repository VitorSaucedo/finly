import { useState } from "react";
import { Plus, Trash2, Pencil, Tag } from "lucide-react";
import { useCategories } from "../../hooks/useCategories.ts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import CategoryFormModal from "./CategoryFormModal.tsx";
import { formatDate } from "../../utils/formatDate";
import type { CategoryResponse } from "../../types/category";

const CategoriesPage = () => {
  const { categories, loading, create, update, remove } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
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

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{categories.length} categories</p>
        <Button icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-10 bg-gray-100 rounded" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Income */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-700">Income</h3>
              <span className="text-xs text-gray-400">
                ({incomeCategories.length})
              </span>
            </div>
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No income categories
              </p>
            ) : (
              <div className="space-y-1">
                {incomeCategories.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    onEdit={() => handleEdit(c)}
                    onDelete={() => setDeletingId(c.id)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Expense */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="text-sm font-semibold text-gray-700">Expense</h3>
              <span className="text-xs text-gray-400">
                ({expenseCategories.length})
              </span>
            </div>
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No expense categories
              </p>
            ) : (
              <div className="space-y-1">
                {expenseCategories.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    onEdit={() => handleEdit(c)}
                    onDelete={() => setDeletingId(c.id)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <Card className="text-center py-12">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No categories yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Create categories to organize your transactions
          </p>
        </Card>
      )}

      {/* Modal */}
      <CategoryFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={async (data) => {
          if (editingCategory) {
            await update(editingCategory.id, data);
          } else {
            await create(data);
          }
          handleCloseModal();
        }}
        initial={editingCategory}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Transactions linked to it will lose their category."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

const CategoryRow = ({
  category: c,
  onEdit,
  onDelete,
}: {
  category: CategoryResponse;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
    <div className="flex items-center gap-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
        style={{ backgroundColor: c.color || "#10b981" }}
      >
        {c.icon ? (
          <span className="text-xs">{c.icon[0]}</span>
        ) : (
          <Tag size={12} />
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-800">{c.name}</p>
        <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {c.isDefault && (
        <Badge variant="neutral" size="sm">
          Default
        </Badge>
      )}
      {!c.isDefault && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
      )}
    </div>
  </div>
);

export default CategoriesPage;
