import api from "./api";
import type { AccountResponse, AccountRequest } from "../types/account";

export const accountService = {
  findAll: async (): Promise<AccountResponse[]> => {
    const response = await api.get<AccountResponse[]>("/api/accounts");
    return response.data;
  },

  findById: async (id: string): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>(`/api/accounts/${id}`);
    return response.data;
  },

  create: async (data: AccountRequest): Promise<AccountResponse> => {
    const response = await api.post<AccountResponse>("/api/accounts", data);
    return response.data;
  },

  update: async (
    id: string,
    data: AccountRequest,
  ): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(
      `/api/accounts/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/accounts/${id}`);
  },
};
