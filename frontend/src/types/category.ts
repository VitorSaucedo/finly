export type CategoryType = "INCOME" | "EXPENSE";

export interface CategoryResponse {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}
