import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  CreditCard as CreditCardIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [accountData, setAccountData] = useState({
    balance: 0.00,
    currency: 'USD',
    accountNumber: user?.accountInfo?.accountNumber || '778908',
    lastTransaction: {
      date: new Date().toISOString(),
      amount: 0.00,
      type: 'CREDIT'
    }
  });

  // Componente para exibir informações básicas da conta
  const AccountSummary = () => {
    return (
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">
              Informações da Conta
            </Typography>
            <AccountBalanceIcon color="primary" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Número da Conta
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {accountData.accountNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Tipo de Conta
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {user?.accountInfo?.type || 'CORPORATE'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Saldo Disponível
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {accountData.currency} {accountData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Última Movimentação
              </Typography>
              <Typography variant="body1">
                {new Date(accountData.lastTransaction.date).toLocaleDateString('pt-BR')}
                {' - '}
                <span style={{ color: accountData.lastTransaction.type === 'CREDIT' ? 'green' : 'red' }}>
                  {accountData.lastTransaction.type === 'CREDIT' ? '+' : '-'} 
                  {accountData.currency} {accountData.lastTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Componente para exibir informações da empresa
  const CompanyInformation = () => {
    return (
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">
              Informações da Empresa
            </Typography>
            <InfoIcon color="primary" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Nome da Empresa
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {user?.companyInfo?.name || 'ERIYASU.CO.LTD'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Nome Legal
              </Typography>
              <Typography variant="body1">
                {user?.companyInfo?.legalName || 'ERIYASU.CO.JP'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Endereço
              </Typography>
              <Typography variant="body1">
                {user?.companyInfo?.address || '6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                País
              </Typography>
              <Typography variant="body1">
                {user?.companyInfo?.country || 'JAPAN'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Número de Registro
              </Typography>
              <Typography variant="body1">
                {user?.companyInfo?.registerNumber || '1200-01-233046'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Componente para ações rápidas
  const QuickActions = () => {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" color="primary" mb={2}>
            Ações Rápidas
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Button 
                variant="outlined" 
                startIcon={<PaymentIcon />} 
                fullWidth
                sx={{ mb: 1 }}
              >
                Transferir
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button 
                variant="outlined" 
                startIcon={<AccountBalanceWalletIcon />} 
                fullWidth
                sx={{ mb: 1 }}
              >
                Extrato
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button 
                variant="outlined" 
                startIcon={<CreditCardIcon />} 
                fullWidth
                sx={{ mb: 1 }}
              >
                Cartões
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button 
                variant="outlined" 
                startIcon={<InfoIcon />} 
                fullWidth
                sx={{ mb: 1 }}
              >
                Suporte
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom mb={4}>
        Olá, {user?.name || 'SHIGEMI MATSUMOTO'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AccountSummary />
        </Grid>
        
        <Grid item xs={12}>
          <CompanyInformation />
        </Grid>
        
        <Grid item xs={12}>
          <QuickActions />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;