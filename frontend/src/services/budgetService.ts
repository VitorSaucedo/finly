import api from "./api";
import type { BudgetResponse, BudgetRequest } from "../types/budget";

export const budgetService = {
  findAll: async (month: number, year: number): Promise<BudgetResponse[]> => {
    const response = await api.get<BudgetResponse[]>("/api/budgets", {
      params: { month, year },
    });
    return response.data;
  },

  findById: async (id: string): Promise<BudgetResponse> => {
    const response = await api.get<BudgetResponse>(`/api/budgets/${id}`);
    return response.data;
  },

  create: async (data: BudgetRequest): Promise<BudgetResponse> => {
    const response = await api.post<BudgetResponse>("/api/budgets", data);
    return response.data;
  },

  update: async (id: string, data: BudgetRequest): Promise<BudgetResponse> => {
    const response = await api.put<BudgetResponse>(`/api/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/budgets/${id}`);
  },
};
