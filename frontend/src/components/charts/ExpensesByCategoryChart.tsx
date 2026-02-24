import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";
import type { BudgetResponse } from "../../types/budget";

interface Props {
  budgets: BudgetResponse[];
}

const FALLBACK_COLORS = [
  "#10b981",
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
];

export const ExpensesByCategoryChart = ({ budgets }: Props) => {
  const data = budgets
    .filter((b) => b.spent > 0)
    .map((b, i) => ({
      name: b.categoryName,
      value: b.spent,
      color: b.categoryColor || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No expense data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #f3f4f6",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
