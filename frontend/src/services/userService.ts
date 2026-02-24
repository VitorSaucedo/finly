import api from "./api";
import type { UserResponse } from "../types/auth";
import type { RegisterRequest } from "../types/auth";

export const userService = {
  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/api/users/me");
    return response.data;
  },

  update: async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>("/api/users/me", data);
    return response.data;
  },

  delete: async (): Promise<void> => {
    await api.delete("/api/users/me");
  },
};
