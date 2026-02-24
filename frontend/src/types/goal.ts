export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface GoalResponse {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageCompleted: number;
  deadline: string | null;
  status: GoalStatus;
  notes: string | null;
  createdAt: string;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  notes?: string;
}
