import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthTokenContext";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Wait for the session check before deciding
    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return <>{children}</>;
}

// Optional: If you want to protect nested routes using Outlet
export function PrivateOutlet() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
}
