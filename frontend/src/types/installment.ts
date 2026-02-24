export type InstallmentStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface InstallmentResponse {
  id: string;
  groupId: string;
  transactionId: string | null;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  createdAt: string;
}

export interface InstallmentGroupResponse {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  description: string;
  totalAmount: number;
  installmentCount: number;
  paidCount: number;
  startDate: string;
  notes: string | null;
  installments: InstallmentResponse[];
  createdAt: string;
}

export interface InstallmentRequest {
  accountId: string;
  categoryId?: string;
  description: string;
  totalAmount: number;
  installmentCount: number;
  startDate: string;
  notes?: string;
}
