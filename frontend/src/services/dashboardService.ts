import api from "./api";
import type { DashboardResponse } from "../types/dashboard";

export const dashboardService = {
  get: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>("/api/dashboard");
    return response.data;
  },
};
