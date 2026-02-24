export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface TransactionResponse {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  destinationAccountId: string | null;
  destinationAccountName: string | null;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  transactionDate: string;
  notes: string | null;
  createdAt: string;
}

export interface TransactionRequest {
  accountId: string;
  categoryId?: string;
  destinationAccountId?: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  transactionDate: string;
  notes?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
