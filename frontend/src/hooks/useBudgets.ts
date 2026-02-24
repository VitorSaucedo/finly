import { useState, useEffect } from "react";
import { budgetService } from "../services/budgetService";
import type { BudgetResponse, BudgetRequest } from "../types/budget";

export const useBudgets = (month: number, year: number) => {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetService.findAll(month, year);
      setBudgets(data);
    } catch {
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: BudgetRequest) => {
    const budget = await budgetService.create(data);
    setBudgets((prev) => [...prev, budget]);
    return budget;
  };

  const update = async (id: string, data: BudgetRequest) => {
    const budget = await budgetService.update(id, data);
    setBudgets((prev) => prev.map((b) => (b.id === id ? budget : b)));
    return budget;
  };

  const remove = async (id: string) => {
    await budgetService.delete(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  useEffect(() => {
    fetchAll();
  }, [month, year]);

  return { budgets, loading, error, create, update, remove, refetch: fetchAll };
};
