import { useDashboard } from "../../hooks/useDashboard";
import { useAppSelector } from "../../store/hooks";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import { MonthlyEvolutionChart } from "../../components/charts/MonthlyEvolutionChart.tsx";
import { ExpensesByCategoryChart } from "../../components/charts/ExpensesByCategoryChart.tsx";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { TransactionResponse } from "../../types/transaction";
import type { BudgetResponse } from "../../types/budget";
import type { GoalResponse } from "../../types/goal";

const DashboardPage = () => {
  const { data, loading } = useDashboard();
  const user = useAppSelector((state) => state.auth.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Here's what's happening with your finances.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(data?.totalBalance ?? 0)}
          icon={<Wallet size={18} />}
          iconBg="bg-emerald-50 text-emerald-600"
          trend={null}
        />
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(data?.totalIncome ?? 0)}
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-50 text-blue-600"
          trend="up"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={formatCurrency(data?.totalExpenses ?? 0)}
          icon={<TrendingDown size={18} />}
          iconBg="bg-red-50 text-red-600"
          trend="down"
        />
        <SummaryCard
          title="Net Balance"
          value={formatCurrency(data?.netBalance ?? 0)}
          icon={<ArrowLeftRight size={18} />}
          iconBg="bg-purple-50 text-purple-600"
          trend={(data?.netBalance ?? 0) >= 0 ? "up" : "down"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Monthly Evolution
          </h3>
          <MonthlyEvolutionChart
            income={data?.totalIncome ?? 0}
            expenses={data?.totalExpenses ?? 0}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Expenses by Category
          </h3>
          <ExpensesByCategoryChart budgets={data?.budgets ?? []} />
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Recent Transactions
            </h3>
            <a
              href="/transactions"
              className="text-xs text-emerald-600 hover:underline"
            >
              View all
            </a>
          </div>
          <div className="space-y-1">
            {(data?.recentTransactions ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No transactions yet
              </p>
            ) : (
              data?.recentTransactions.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))
            )}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Budgets */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Budgets</h3>
              <a
                href="/budgets"
                className="text-xs text-emerald-600 hover:underline"
              >
                View all
              </a>
            </div>
            <div className="space-y-3">
              {(data?.budgets ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  No budgets this month
                </p>
              ) : (
                data?.budgets
                  .slice(0, 4)
                  .map((b) => <BudgetRow key={b.id} budget={b} />)
              )}
            </div>
          </Card>

          {/* Goals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Goals</h3>
              <a
                href="/goals"
                className="text-xs text-emerald-600 hover:underline"
              >
                View all
              </a>
            </div>
            <div className="space-y-3">
              {(data?.goals ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  No goals yet
                </p>
              ) : (
                data?.goals
                  .slice(0, 3)
                  .map((g) => <GoalRow key={g.id} goal={g} />)
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const SummaryCard = ({
  title,
  value,
  icon,
  iconBg,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  trend: "up" | "down" | null;
}) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-xl font-semibold text-gray-900 mt-1 font-mono">
          {value}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-3">
        {trend === "up" ? (
          <ArrowUpRight size={13} className="text-emerald-500" />
        ) : (
          <ArrowDownRight size={13} className="text-red-500" />
        )}
        <span
          className={`text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}
        >
          This month
        </span>
      </div>
    )}
  </Card>
);

const TransactionRow = ({
  transaction: t,
}: {
  transaction: TransactionResponse;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <div
        className={`p-1.5 rounded-lg ${
          t.type === "INCOME"
            ? "bg-emerald-50 text-emerald-600"
            : t.type === "EXPENSE"
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-600"
        }`}
      >
        {t.type === "INCOME" ? (
          <ArrowUpRight size={14} />
        ) : t.type === "EXPENSE" ? (
          <ArrowDownRight size={14} />
        ) : (
          <ArrowLeftRight size={14} />
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-800">{t.description}</p>
        <p className="text-xs text-gray-400">{formatDate(t.transactionDate)}</p>
      </div>
    </div>
    <span
      className={`text-xs font-semibold font-mono ${
        t.type === "INCOME" ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {t.type === "INCOME" ? "+" : "-"}
      {formatCurrency(t.amount)}
    </span>
  </div>
);

const BudgetRow = ({ budget: b }: { budget: BudgetResponse }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-600 font-medium">
        {b.categoryName}
      </span>
      <span className="text-xs text-gray-400 font-mono">
        {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
      </span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all ${
          b.status === "EXCEEDED"
            ? "bg-red-500"
            : b.percentageUsed > 80
              ? "bg-amber-500"
              : "bg-emerald-500"
        }`}
        style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
      />
    </div>
    {b.status === "EXCEEDED" && (
      <p className="text-xs text-red-500 mt-0.5">Budget exceeded</p>
    )}
  </div>
);

const GoalRow = ({ goal: g }: { goal: GoalResponse }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-600 font-medium truncate max-w-32">
        {g.name}
      </span>
      <Badge
        variant={g.status === "COMPLETED" ? "success" : "neutral"}
        size="sm"
      >
        {g.status === "COMPLETED"
          ? "Done"
          : `${g.percentageCompleted.toFixed(0)}%`}
      </Badge>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full bg-emerald-500 transition-all"
        style={{ width: `${Math.min(g.percentageCompleted, 100)}%` }}
      />
    </div>
    <p className="text-xs text-gray-400 mt-0.5 font-mono">
      {formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}
    </p>
  </div>
);

export default DashboardPage;
