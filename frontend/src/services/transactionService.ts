import api from "./api";
import type {
  TransactionResponse,
  TransactionRequest,
  PageResponse,
} from "../types/transaction";

export interface TransactionParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const transactionService = {
  findAll: async (
    params: TransactionParams = {},
  ): Promise<PageResponse<TransactionResponse>> => {
    const response = await api.get<PageResponse<TransactionResponse>>(
      "/api/transactions",
      {
        params: { page: 0, size: 10, sort: "transactionDate,desc", ...params },
      },
    );
    return response.data;
  },

  findById: async (id: string): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>(
      `/api/transactions/${id}`,
    );
    return response.data;
  },

  create: async (data: TransactionRequest): Promise<TransactionResponse> => {
    const response = await api.post<TransactionResponse>(
      "/api/transactions",
      data,
    );
    return response.data;
  },

  update: async (
    id: string,
    data: TransactionRequest,
  ): Promise<TransactionResponse> => {
    const response = await api.put<TransactionResponse>(
      `/api/transactions/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/transactions/${id}`);
  },
};
