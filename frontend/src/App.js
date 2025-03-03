import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector, useDispatch } from 'react-redux';
import theme from './theme';
import { checkAuthStatus } from './store/slices/authSlice';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SetPassword from './pages/auth/SetPassword';
import TwoFactorAuth from './pages/auth/TwoFactorAuth';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AccountManagement from './pages/admin/AccountManagement';
import UserManagement from './pages/admin/UserManagement';
import TransactionMonitoring from './pages/admin/TransactionMonitoring';
import SystemSettings from './pages/admin/SystemSettings';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import AccountDetails from './pages/client/AccountDetails';
import TransferFunds from './pages/client/TransferFunds';
import TransactionHistory from './pages/client/TransactionHistory';
import Profile from './pages/client/Profile';

// Common
import NotFound from './pages/common/NotFound';
import AccessDenied from './pages/common/AccessDenied';
import Maintenance from './pages/common/Maintenance';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/access-denied" />;
  }
  
  return element;
};

const App = () => {
  const dispatch = useDispatch();
  const { theme: uiTheme } = useSelector((state) => state.ui);
  
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);
  
  // Create theme based on user preference
  const appliedTheme = React.useMemo(
    () => ({
      ...theme,
      palette: {
        ...theme.palette,
        mode: uiTheme?.mode || 'light',
      },
    }),
    [uiTheme]
  );
  
  return (
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="set-password/:token" element={<SetPassword />} />
          <Route path="two-factor" element={<TwoFactorAuth />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminLayout />} requiredRole="admin" />}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="transactions" element={<TransactionMonitoring />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
        
        {/* Client Routes */}
        <Route path="/client" element={<ProtectedRoute element={<ClientLayout />} requiredRole="client" />}>
          <Route index element={<Navigate to="/client/dashboard" />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="accounts/:accountId" element={<AccountDetails />} />
          <Route path="transfer" element={<TransferFunds />} />
          <Route path="transactions" element={<TransactionHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Common Routes */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
