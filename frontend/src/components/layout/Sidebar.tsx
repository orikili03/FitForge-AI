import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    Flame,
    History,
    Dumbbell,
    User,
    LogOut,
} from "lucide-react";
import { useAuthToken } from "../../domains/auth/AuthTokenContext";
import { Button, Logo } from "../ui";

const navItems = [
    { to: "/", label: "Today's WOD", icon: Flame, end: true },
    { to: "/equipment", label: "Equipment", icon: Dumbbell, end: false },
    { to: "/history", label: "History", icon: History, end: false },
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
            <div className="flex flex-col gap-ds-1 border-b border-ds-border px-ds-2 py-ds-3">
                <Link
                    to="/"
                    className="self-start rounded-ds-md py-1 -ml-1 transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-surface"
                    aria-label="Go to home"
                >
                    <Logo className="h-9 w-auto shrink-0 text-amber-400" />
                </Link>
                <div className="truncate text-ds-caption text-ds-text-muted">
                    CrossFit WOD Engine
                </div>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-ds-1 py-ds-3">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-ds-md px-3 py-2.5 text-ds-body-sm font-medium transition-all duration-250 ${isActive
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
