import { Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import StadiumsPage from './pages/StadiumsPage';
import UsersPage from './pages/UsersPage';
import BookingsPage from './pages/BookingsPage';
import DisputesPage from './pages/DisputesPage';
import ReviewsPage from './pages/ReviewsPage';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4">
        {/* Sleek Glowing Blue Circular Loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#3b82f6]/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#3b82f6] rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        </div>
        <p className="text-sm font-semibold text-[#a3a3a3] tracking-widest uppercase animate-pulse">Verifying Admin Session...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="stadiums"  element={<StadiumsPage />} />
        <Route path="users"     element={<UsersPage />} />
        <Route path="bookings"  element={<BookingsPage />} />
        <Route path="disputes"  element={<DisputesPage />} />
        <Route path="reviews"   element={<ReviewsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
