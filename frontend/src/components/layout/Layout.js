import React from 'react';
import { useLocation } from 'react-router-dom';
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
  
  // Verifica se estamos em uma rota de administrador
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Verifica se o usuário existe antes de acessar suas propriedades
  if (!isAuthenticated || !user) {
    // Renderiza um layout básico ou redireciona para login
    return <div className="loading-container">{children}</div>;
  }
  
  // Renderiza o layout apropriado com base no papel do usuário e na rota atual
  if (user.role === 'admin' || isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  // Para usuários comuns
  return <ClientLayout>{children}</ClientLayout>;
};

export default Layout;
