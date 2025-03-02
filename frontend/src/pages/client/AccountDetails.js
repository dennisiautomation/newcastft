import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as SwapHorizIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  fetchAccountDetails,
  fetchAccountLimits,
  fetchRecentTransactions
} from '../../store/slices/accountSlice';

const AccountDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    accountDetails,
    limits,
    recentTransactions,
    loading,
    error
  } = useSelector((state) => state.accounts);
  
  // Buscar dados ao montar o componente
  useEffect(() => {
    dispatch(fetchAccountDetails());
    dispatch(fetchAccountLimits());
    dispatch(fetchRecentTransactions({ limit: 5 }));
  }, [dispatch]);
  
  // Formatar moeda
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Formatar data
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Navegar para transferência
  const handleTransfer = () => {
    navigate('/transfer');
  };
  
  // Navegar para histórico
  const handleViewHistory = () => {
    navigate('/history');
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Detalhes da Conta
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Saldo e Ações Rápidas */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : accountDetails ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccountBalanceIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Conta {accountDetails.accountType}
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(accountDetails.balance, accountDetails.accountType)}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Tooltip title="Atualizar">
                      <IconButton
                        onClick={() => dispatch(fetchAccountDetails())}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<SwapHorizIcon />}
                      onClick={handleTransfer}
                      size="large"
                    >
                      Nova Transferência
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={handleViewHistory}
                      size="large"
                    >
                      Ver Histórico
                    </Button>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Typography>Nenhum dado disponível</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Limites */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Limites
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : limits ? (
              <List>
                <ListItem>
                  <ListItemText
                    primary="Limite Diário"
                    secondary={formatCurrency(limits.dailyLimit, accountDetails?.accountType)}
                  />
                  <Typography color="text.secondary">
                    Disponível: {formatCurrency(limits.dailyRemaining, accountDetails?.accountType)}
                  </Typography>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Limite por Transação"
                    secondary={formatCurrency(limits.transactionLimit, accountDetails?.accountType)}
                  />
                </ListItem>
                
                {limits.requiresApproval && (
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Aprovação Necessária"
                      secondary={`Para transferências acima de ${formatCurrency(limits.approvalThreshold, accountDetails?.accountType)}`}
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <Typography>Nenhum limite configurado</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Transações Recentes */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Transações Recentes
              </Typography>
              
              <Button
                endIcon={<FileDownloadIcon />}
                onClick={handleViewHistory}
              >
                Ver Todas
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : recentTransactions?.length > 0 ? (
              <List>
                {recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemIcon>
                        {transaction.type === 'credit' ? (
                          <TrendingUpIcon color="success" />
                        ) : (
                          <TrendingDownIcon color="error" />
                        )}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={transaction.description}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon fontSize="small" color="action" />
                            {formatDate(transaction.timestamp)}
                            {transaction.status === 'pending' && (
                              <Chip
                                size="small"
                                label="Pendente"
                                color="warning"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                      
                      <Typography
                        variant="body1"
                        color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" align="center">
                Nenhuma transação recente
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountDetails;
