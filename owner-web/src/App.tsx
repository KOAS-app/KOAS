import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SlotsPage from './pages/SlotsPage';
import BookingsPage from './pages/BookingsPage';
import ReviewsPage from './pages/ReviewsPage';
import BankDetailsPage from './pages/BankDetailsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import SubscriptionRequestsPage from './pages/SubscriptionRequestsPage';
import VerifyMembershipPage from './pages/VerifyMembershipPage';
import { ReactNode } from 'react';

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
      {/* Public Routes with Shared Navbar and Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      </Route>

      {/* Private Dashboard & Operations */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="bank-details" element={<BankDetailsPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="subscription-plans" element={<SubscriptionPlansPage />} />
        <Route path="subscription-requests" element={<SubscriptionRequestsPage />} />
        <Route path="verify-membership" element={<VerifyMembershipPage />} />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
