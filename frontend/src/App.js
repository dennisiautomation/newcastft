import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

// Temas
import { lightTheme, darkTheme } from './themes';

// Provedor de idiomas
import { LanguageProvider } from './contexts/LanguageContext';

// Páginas
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import Profile from './pages/client/Profile';
import MyAccount from './pages/client/MyAccount';
import Transfers from './pages/client/Transfers';
import Transactions from './pages/client/Transactions';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AccountManagement from './pages/admin/AccountManagement';
import TransactionReport from './pages/admin/TransactionReport';
import TransactionsReport from './pages/admin/TransactionsReport';
import SystemSettings from './pages/admin/SystemSettings';
import NotFound from './pages/common/NotFound';

// Componentes
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Redux actions
import { checkAuthStatus } from './store/slices/authSlice';
import { fetchUserPreferences } from './store/slices/userSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const userState = useSelector(state => state.user);
  const darkMode = userState?.preferences?.darkMode || false;

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserPreferences());
    }
  }, [dispatch, isAuthenticated]);

  const theme = darkMode ? darkTheme : lightTheme;

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Redirecionamento da raiz */}
            <Route path="/" element={
              <Navigate to={user?.role === 'ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />
            } />
            
            {/* Redirecionamento específico do dashboard */}
            <Route path="/dashboard" element={
              user?.role === 'ADMIN' 
                ? <Navigate to="/admin/dashboard" replace /> 
                : <ProtectedRoute>
                    <Layout>
                      <ClientDashboard />
                    </Layout>
                  </ProtectedRoute>
            } />
            <Route path="/client/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/my-account" element={
              <ProtectedRoute>
                <Layout>
                  <MyAccount />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/client/my-account" element={<Navigate to="/my-account" replace />} />
            <Route path="/transfers" element={
              <ProtectedRoute>
                <Layout>
                  <Transfers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/client/transfers" element={<Navigate to="/transfers" replace />} />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/client/transactions" element={<Navigate to="/transactions" replace />} />
            
            {/* Rotas de Administrador */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/accounts" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <AccountManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/transaction-report" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <TransactionReport />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/transactions-report" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <TransactionsReport />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout>
                  <SystemSettings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        </LocalizationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
