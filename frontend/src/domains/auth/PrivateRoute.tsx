import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthToken } from "./AuthTokenContext";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuthToken();
    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }
    return <>{children}</>;
}

// Optional: If you want to protect nested routes using Outlet
export function PrivateOutlet() {
    const { token } = useAuthToken();
    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }
    return <Outlet />;
}
