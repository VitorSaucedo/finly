import { useState, useEffect } from "react";
import { goalService } from "../services/goalService";
import type { GoalResponse, GoalRequest } from "../types/goal";

export const useGoals = () => {
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalService.findAll();
      setGoals(data);
    } catch {
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: GoalRequest) => {
    const goal = await goalService.create(data);
    setGoals((prev) => [...prev, goal]);
    return goal;
  };

  const update = async (id: string, data: GoalRequest) => {
    const goal = await goalService.update(id, data);
    setGoals((prev) => prev.map((g) => (g.id === id ? goal : g)));
    return goal;
  };

  const deposit = async (id: string, amount: number) => {
    const goal = await goalService.deposit(id, amount);
    setGoals((prev) => prev.map((g) => (g.id === id ? goal : g)));
    return goal;
  };

  const remove = async (id: string) => {
    await goalService.delete(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    goals,
    loading,
    error,
    create,
    update,
    deposit,
    remove,
    refetch: fetchAll,
  };
};
