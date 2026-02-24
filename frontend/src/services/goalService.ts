import api from "./api";
import type { GoalResponse, GoalRequest } from "../types/goal";

export const goalService = {
  findAll: async (): Promise<GoalResponse[]> => {
    const response = await api.get<GoalResponse[]>("/api/goals");
    return response.data;
  },

  findById: async (id: string): Promise<GoalResponse> => {
    const response = await api.get<GoalResponse>(`/api/goals/${id}`);
    return response.data;
  },

  create: async (data: GoalRequest): Promise<GoalResponse> => {
    const response = await api.post<GoalResponse>("/api/goals", data);
    return response.data;
  },

  update: async (id: string, data: GoalRequest): Promise<GoalResponse> => {
    const response = await api.put<GoalResponse>(`/api/goals/${id}`, data);
    return response.data;
  },

  deposit: async (id: string, amount: number): Promise<GoalResponse> => {
    const response = await api.patch<GoalResponse>(
      `/api/goals/${id}/deposit`,
      null,
      {
        params: { amount },
      },
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/goals/${id}`);
  },
};
