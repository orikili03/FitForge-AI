import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../domains/auth/PrivateRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TodayWodPage } from '../pages/TodayWodPage';
import { WorkoutBuilderPage } from '../pages/WorkoutBuilderPage';
import { HistoryPage } from '../pages/HistoryPage';
import { EquipmentPage } from '../pages/EquipmentPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { useLocation } from 'react-router-dom';

export default function App() {
    const location = useLocation();
    console.log(`📍 App rendering at path: ${location.pathname}${location.search}${location.hash}`);

    return (
        <Routes>
            {/* Public auth routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            {/* Protected app routes */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <DashboardLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<TodayWodPage />} />
                <Route path="wod/today" element={<Navigate to="/" replace />} />
                <Route path="wod/generate" element={<TodayWodPage />} />
                <Route path="wod/builder" element={<WorkoutBuilderPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="equipment" element={<EquipmentPage />} />
                <Route path="gear" element={<Navigate to="/equipment" replace />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch‑all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

