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
import { useNavigate, useLocation } from 'react-router-dom';

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();
    console.log(`📍 App rendering at path: ${location.pathname}${location.search}${location.hash}`);

    return (
        <div data-debug-root="true">
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

                {/* Catch‑all Route */}
                <Route path="*" element={
                    <div className="flex min-h-screen flex-col items-center justify-center bg-ds-bg p-4 text-center">
                        <h1 className="text-4xl font-bold text-ds-text">404</h1>
                        <p className="mt-2 text-ds-text-muted">Page not found: {location.pathname}</p>
                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 rounded-ds-md bg-ds-accent px-4 py-2 text-stone-950 font-medium hover:bg-ds-accent-hover transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                } />
            </Routes>
        </div>
    );
}

