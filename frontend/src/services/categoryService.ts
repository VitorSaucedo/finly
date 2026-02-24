import api from "./api";
import type { CategoryResponse, CategoryRequest } from "../types/category";

export const categoryService = {
  findAll: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>("/api/categories");
    return response.data;
  },

  findById: async (id: string): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>(`/api/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>("/api/categories", data);
    return response.data;
  },

  update: async (
    id: string,
    data: CategoryRequest,
  ): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(
      `/api/categories/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },
};
