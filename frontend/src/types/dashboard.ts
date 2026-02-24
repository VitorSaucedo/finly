import type { AccountResponse } from "./account";
import type { BudgetResponse } from "./budget";
import type { GoalResponse } from "./goal";
import type { TransactionResponse } from "./transaction";

export interface DashboardResponse {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  accounts: AccountResponse[];
  budgets: BudgetResponse[];
  goals: GoalResponse[];
  recentTransactions: TransactionResponse[];
}
