import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  AccountBalance, 
  Payment, 
  CreditCard, 
  ArrowUpward, 
  ArrowDownward,
  Notifications,
  AttachMoney
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { fetchRecentTransactions } from '../../store/slices/transactionSlice';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { accounts, loading: accountsLoading } = useSelector(state => state.accounts);
  const { transactions, loading: transactionsLoading } = useSelector(state => state.transactions);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchAccounts());
    // Remover a chamada para buscar transações
    // dispatch(fetchRecentTransactions({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    // Chamada de API para o dashboard com token de autenticação
    const fetchDashboardData = async () => {
      try {
        // Obter o token do localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Usuário não autenticado');
          return;
        }
        
        const response = await fetch('/api/client/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setDashboardData(data.data);
        } else {
          setError(data.message || 'Erro ao carregar dados do dashboard');
        }
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.');
      }
    };

    fetchDashboardData();
  }, []);

  // Usar os dados do dashboard em vez dos dados das contas
  const totalBalance = dashboardData?.accountSummary?.totalBalance || 0;
  const activeAccounts = dashboardData?.accountSummary?.accounts?.length || 0;
  const pendingTransactions = dashboardData?.accountSummary?.pendingTransactions || 0;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Olá, Cliente Teste
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Resumo de contas */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Resumo Financeiro</Typography>
          <Button 
            component={Link} 
            to="/accounts" 
            variant="outlined" 
            size="small"
          >
            Ver Todas as Contas
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Saldo Total</Typography>
                </Box>
                {accountsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(totalBalance, 'USD')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CreditCard sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Contas Ativas</Typography>
                </Box>
                {accountsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {activeAccounts}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Payment sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Transações Pendentes</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {pendingTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transações Recentes - Removido para o cliente */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transações Recentes</Typography>
          <Button 
            component={Link} 
            to="/transactions" 
            variant="outlined" 
            size="small"
          >
            Ver Todas
          </Button>
        </Box>
        
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Não há transações recentes para exibir.
          </Typography>
        </Box>
      </Paper>
      
      {/* Ações Rápidas */}
      <Typography variant="h6" gutterBottom>
        Ações Rápidas
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1">Transferir</Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/transfers" 
                fullWidth
                size="small"
              >
                Iniciar
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="body1">Extrato</Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/transactions" 
                fullWidth
                size="small"
              >
                Ver
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Notificações */}
      {dashboardData?.notifications && dashboardData.notifications.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="h6">Notificações</Typography>
          </Box>
          <List>
            {dashboardData.notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem>
                  <ListItemText 
                    primary={notification.message}
                    secondary={new Date(notification.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                {index < dashboardData.notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;