import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    Flame,
    History,
    Dumbbell,
    User,
    LogOut,
} from "lucide-react";
import { useAuthToken } from "../../domains/auth/AuthTokenContext";
import { Logo } from "../ui";

const navItems = [
    { to: "/", label: "Today's WOD", end: true },
    { to: "/equipment", label: "Equipment", end: false },
    { to: "/history", label: "History", end: false },
    { to: "/profile", label: "Profile", end: false },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "/": Flame,
    "/history": History,
    "/equipment": Dumbbell,
    "/profile": User,
};

export function TopBar() {
    const [open, setOpen] = useState(false);
    const { clearToken } = useAuthToken();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearToken();
        navigate("/auth/login");
        setOpen(false);
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-ds-border bg-ds-surface/95 shadow-ds-sm backdrop-blur-md lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
                <Link
                    to="/"
                    className="flex items-center gap-2.5 rounded-ds-md py-1.5 pr-2 -ml-1 transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-surface"
                    aria-label="Go to home"
                    onClick={() => setOpen(false)}
                >
                    <Logo className="h-8 w-auto shrink-0 text-amber-400" />
                </Link>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="rounded-ds-md p-2.5 text-ds-text-muted transition-colors duration-250 hover:bg-ds-surface-hover hover:text-ds-text"
                    aria-expanded={open}
                    aria-label="Toggle menu"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>
            {open && (
                <nav className="absolute left-0 right-0 top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-ds-border bg-ds-surface py-2 shadow-ds-lg">
                    {navItems.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 text-ds-body-sm font-medium transition-colors duration-250 ${isActive
                                    ? "bg-ds-surface-hover text-ds-text"
                                    : "text-ds-text-muted hover:bg-ds-surface-hover/60 hover:text-ds-text"
                                }`
                            }
                        >
                            {iconMap[to] && (() => {
                                const Icon = iconMap[to];
                                return <Icon className="h-5 w-5 shrink-0" />;
                            })()}
                            {label}
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-ds-body-sm font-medium text-ds-text-muted transition-colors duration-250 hover:bg-ds-surface-hover/60 hover:text-red-400"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </nav>
            )}
        </header>
    );
}
