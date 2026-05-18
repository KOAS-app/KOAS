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
