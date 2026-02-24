import { useState, useEffect } from "react";
import { categoryService } from "../services/categoryService";
import type { CategoryResponse, CategoryRequest } from "../types/category";

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.findAll();
      setCategories(data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: CategoryRequest) => {
    const category = await categoryService.create(data);
    setCategories((prev) => [...prev, category]);
    return category;
  };

  const update = async (id: string, data: CategoryRequest) => {
    const category = await categoryService.update(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
    return category;
  };

  const remove = async (id: string) => {
    await categoryService.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    categories,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchAll,
  };
};
