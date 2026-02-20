import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Flame,
  Sparkles,
  History,
  BarChart3,
  Dumbbell,
  User,
  LogOut,
} from "lucide-react";
import { useAuthToken } from "../../hooks/useAuthToken";
import { Button } from "../ui/Button";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/wod/today", label: "Today's WOD", icon: Flame, end: false },
  { to: "/wod/generate", label: "Generate", icon: Sparkles, end: false },
  { to: "/history", label: "History", icon: History, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
  { to: "/equipment", label: "Equipment", icon: Dumbbell, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export function Sidebar() {
  const { clearToken } = useAuthToken();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/auth/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col border-r border-ds-border bg-ds-surface lg:flex">
      <div className="flex items-center gap-3 border-b border-ds-border px-ds-2 py-ds-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ds-lg bg-ds-accent text-ds-body-sm font-bold text-stone-950 shadow-ds-sm">
          FF
        </span>
        <div className="min-w-0">
          <div className="truncate text-ds-body-sm font-semibold text-ds-text">
            FitForge AI
          </div>
          <div className="truncate text-ds-caption text-ds-text-muted">
            CrossFit WOD Engine
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-ds-1 py-ds-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-ds-md px-3 py-2.5 text-ds-body-sm font-medium transition-all duration-250 ${
                isActive
                  ? "bg-ds-surface-hover text-ds-text"
                  : "text-ds-text-muted hover:bg-ds-surface-hover/60 hover:text-ds-text"
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ds-border p-ds-1">
        <Button
          variant="ghost"
          size="md"
          fullWidth
          className="justify-start gap-3 text-ds-text-muted hover:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
