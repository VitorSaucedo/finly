import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Tag,
  Wallet,
  Target,
  PiggyBank,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleSidebar } from "../../store/uiSlice";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/installments", icon: CreditCard, label: "Installments" },
  { to: "/accounts", icon: Wallet, label: "Accounts" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/budgets", icon: PiggyBank, label: "Budgets" },
  { to: "/goals", icon: Target, label: "Goals" },
];

const Sidebar = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <aside
      className={`
      relative flex flex-col h-screen bg-gray-950 border-r border-gray-800
      transition-all duration-300 ease-in-out shrink-0
      ${sidebarOpen ? "w-60" : "w-16"}
    `}
    >
      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-8 bg-gray-950 border border-gray-800 rounded-full p-0.5 z-10 text-gray-400 hover:text-emerald-400 transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-6 border-b border-gray-800 ${!sidebarOpen && "justify-center"}`}
      >
        <div className="bg-emerald-500 p-1.5 rounded-lg shrink-0">
          <TrendingUp className="text-white w-4 h-4" />
        </div>
        {sidebarOpen && (
          <span className="text-white font-semibold text-lg tracking-tight">
            Finly
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
              }
              ${!sidebarOpen && "justify-center"}
            `}
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={17} className="shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 py-4 border-t border-gray-800 space-y-0.5">
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
            }
            ${!sidebarOpen && "justify-center"}
          `}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          {sidebarOpen && (
            <span className="truncate">{user?.name ?? "Profile"}</span>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150
            ${!sidebarOpen && "justify-center"}
          `}
          title={!sidebarOpen ? "Logout" : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
