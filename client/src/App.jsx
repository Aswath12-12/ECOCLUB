import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { StudentLayout } from './layouts/StudentLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminHouses } from './pages/admin/AdminHouses';
import { AdminActivities } from './pages/admin/AdminActivities';
import { AdminWeeklyMarks } from './pages/admin/AdminWeeklyMarks';
import { AdminRankings } from './pages/admin/AdminRankings';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminPasswordRequests } from './pages/admin/AdminPasswordRequests';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentWeeklyMarks } from './pages/student/StudentWeeklyMarks';
import { StudentHouse } from './pages/student/StudentHouse';
import { StudentRanking } from './pages/student/StudentRanking';
import { StudentProfile } from './pages/student/StudentProfile';

/**
 * Route protection for authenticated users
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Checking authentication..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

/**
 * Route protection specifically for Admin users
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Verifying admin credentials..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/student/dashboard" replace />;
  return children;
};

/**
 * Route protection specifically for Student users
 * Enforces mandatory change password redirect if mustChangePassword is true!
 */
const StudentRoute = ({ children }) => {
  const { isAuthenticated, role, mustChangePassword, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner message="Verifying student access..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'STUDENT') return <Navigate to="/admin/dashboard" replace />;

  // Enforce mandatory password change redirect
  if (mustChangePassword && location.pathname !== '/student/change-password') {
    return <Navigate to="/student/change-password" replace />;
  }

  return children;
};

/**
 * Root Redirector: Sends authenticated user to their role's dashboard
 */
const HomeRedirect = () => {
  const { isAuthenticated, role, mustChangePassword, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Launching EcoClub..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (mustChangePassword) return <Navigate to="/student/change-password" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Root redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Mandatory or voluntary password change route */}
          <Route
            path="/student/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="houses" element={<AdminHouses />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="weekly-marks" element={<AdminWeeklyMarks />} />
            <Route path="rankings" element={<AdminRankings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="password-requests" element={<AdminPasswordRequests />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <StudentRoute>
                <StudentLayout />
              </StudentRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="marks" element={<StudentWeeklyMarks />} />
            <Route path="house" element={<StudentHouse />} />
            <Route path="ranking" element={<StudentRanking />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
