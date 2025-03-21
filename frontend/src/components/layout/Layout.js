import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../../layouts/AdminLayout';
import ClientLayout from '../../layouts/ClientLayout';

/**
 * Layout principal que decide qual layout renderizar com base no papel do usuário
 * Recebe children como props para renderizar o conteúdo dentro do layout
 */
const Layout = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();
  
  console.log("Current user:", user);
  console.log("Current path:", location.pathname);
  console.log("User role:", user?.role);
  
  // Verifica se o usuário existe antes de acessar suas propriedades
  if (!isAuthenticated || !user) {
    // Renderiza um layout básico ou redireciona para login
    return <div className="loading-container">{children}</div>;
  }

  // Verifica explicitamente se é admin e redireciona para /admin/dashboard se necessário
  if (user.role === 'ADMIN' && !location.pathname.startsWith('/admin')) {
    console.log("Redirecting admin to admin dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Se o caminho começa com /admin, sempre use o AdminLayout
  if (location.pathname.startsWith('/admin')) {
    console.log("Using admin layout due to path");
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  // Se o usuário é ADMIN, use AdminLayout (garantia dupla)
  if (user.role === 'ADMIN') {
    console.log("Using admin layout due to role");
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  // Para usuários comuns
  console.log("Using client layout");
  return <ClientLayout>{children}</ClientLayout>;
};

export default Layout;
