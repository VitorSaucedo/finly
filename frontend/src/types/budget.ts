export type BudgetStatus = "ACTIVE" | "EXCEEDED" | "COMPLETED";

export interface BudgetResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  month: number;
  year: number;
  status: BudgetStatus;
  createdAt: string;
}

export interface BudgetRequest {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}
