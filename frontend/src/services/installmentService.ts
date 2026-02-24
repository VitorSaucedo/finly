import api from "./api";
import type {
  InstallmentGroupResponse,
  InstallmentRequest,
  InstallmentResponse,
} from "../types/installment";
import type { PageResponse } from "../types/transaction";

export const installmentService = {
  findAll: async (
    page = 0,
    size = 10,
  ): Promise<PageResponse<InstallmentGroupResponse>> => {
    const response = await api.get<PageResponse<InstallmentGroupResponse>>(
      "/api/installments",
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  findById: async (id: string): Promise<InstallmentGroupResponse> => {
    const response = await api.get<InstallmentGroupResponse>(
      `/api/installments/${id}`,
    );
    return response.data;
  },

  create: async (
    data: InstallmentRequest,
  ): Promise<InstallmentGroupResponse> => {
    const response = await api.post<InstallmentGroupResponse>(
      "/api/installments",
      data,
    );
    return response.data;
  },

  pay: async (id: string): Promise<InstallmentResponse> => {
    const response = await api.post<InstallmentResponse>(
      `/api/installments/${id}/pay`,
    );
    return response.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.delete(`/api/installments/${id}/cancel`);
  },
};
