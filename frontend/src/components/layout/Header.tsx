import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your finances" },
  "/transactions": {
    title: "Transactions",
    subtitle: "All your income and expenses",
  },
  "/installments": {
    title: "Installments",
    subtitle: "Manage your installment plans",
  },
  "/accounts": {
    title: "Accounts",
    subtitle: "Your bank accounts and wallets",
  },
  "/categories": {
    title: "Categories",
    subtitle: "Organize your transactions",
  },
  "/budgets": { title: "Budgets", subtitle: "Control your monthly spending" },
  "/goals": { title: "Goals", subtitle: "Track your financial goals" },
  "/profile": { title: "Profile", subtitle: "Your account settings" },
};

const Header = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const page = pageTitles[location.pathname] ?? {
    title: "Finly",
    subtitle: "",
  };

  const now = new Date();
  const formatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{page.title}</h1>
        <p className="text-xs text-gray-400">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 hidden sm:block">
          {formatted}
        </span>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
