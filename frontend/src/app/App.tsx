import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { GenerateWorkoutPage } from "../pages/GenerateWorkoutPage";
import { HistoryPage } from "../pages/HistoryPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { ProfilePage } from "../pages/ProfilePage";
import { TodayWodPage } from "../pages/TodayWodPage";
import { WorkoutBuilderPage } from "../pages/WorkoutBuilderPage";
import { EquipmentPage } from "../pages/EquipmentPage";
import { useAuthToken } from "../hooks/useAuthToken";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthToken();
  if (!token) {
    return <LoginPage />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="wod/today" element={<TodayWodPage />} />
        <Route path="wod/generate" element={<GenerateWorkoutPage />} />
        <Route path="wod/builder" element={<WorkoutBuilderPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

