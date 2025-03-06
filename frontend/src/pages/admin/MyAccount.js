import React, { useEffect, useState } from 'react';
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
  Chip,
  Menu,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
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
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  MonetizationOn as MonetizationOnIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import axios from 'axios';
import { fetchUserAccounts, fetchAccountById } from '../../store/slices/accountSlice';

// Dados simulados para contas FT quando a API não estiver disponível
const mockFtAccounts = {
  usd: {
    accountNumber: '60428',
    accountType: 'USD',
    externalAccountId: '60428',
    balance: 250000.00,
    status: 'active',
    lastActivity: new Date().toISOString()
  },
  eur: {
    accountNumber: '60429',
    accountType: 'EUR',
    externalAccountId: '60429',
    balance: 180000.00,
    status: 'active',
    lastActivity: new Date().toISOString()
  }
};

// Dados simulados para transações quando a API não estiver disponível
const mockTransactions = {
  '60428': [
    {
      id: 'trans-001',
      type: 'DEPOSIT',
      amount: 50000,
      date: '2025-02-28T10:30:00Z',
      description: 'Client deposit - ABC Corp',
      status: 'completed',
      currency: 'USD'
    },
    {
      id: 'trans-002',
      type: 'WITHDRAWAL',
      amount: -15000,
      date: '2025-03-01T14:45:00Z',
      description: 'Client withdrawal - XYZ Ltd',
      status: 'completed',
      currency: 'USD'
    },
    {
      id: 'trans-003',
      type: 'DEPOSIT',
      amount: 75000,
      date: '2025-03-03T09:15:00Z',
      description: 'Client deposit - 123 Industries',
      status: 'completed',
      currency: 'USD'
    }
  ],
  '60429': [
    {
      id: 'trans-004',
      type: 'DEPOSIT',
      amount: 40000,
      date: '2025-02-27T11:20:00Z',
      description: 'Client deposit - European Client',
      status: 'completed',
      currency: 'EUR'
    },
    {
      id: 'trans-005',
      type: 'WITHDRAWAL',
      amount: -10000,
      date: '2025-03-02T16:30:00Z',
      description: 'Client withdrawal - Paris Corp',
      status: 'completed',
      currency: 'EUR'
    },
    {
      id: 'trans-006',
      type: 'DEPOSIT',
      amount: 60000,
      date: '2025-03-04T08:45:00Z',
      description: 'Client deposit - Berlin GmbH',
      status: 'completed',
      currency: 'EUR'
    }
  ]
};

const MyAccount = () => {
  const dispatch = useDispatch();
  const { user, loading: userLoading } = useSelector((state) => state.auth);
  const { userAccounts, loading: accountsLoading, error: accountsError } = useSelector((state) => state.accounts);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  
  // Carregar contas do usuário
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obter token de autenticação do localStorage
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        if (user?.role === 'admin') {
          // Para administradores, buscar contas representantes específicas da API FT
          try {
            // Tentar buscar dados reais da API
            const [usdResponse, eurResponse] = await Promise.all([
              axios.get('/api/ft-accounts/usd', config),
              axios.get('/api/ft-accounts/eur', config)
            ]);
            
            const usdAccount = {
              accountNumber: '60428',
              accountType: 'USD',
              externalAccountId: '60428',
              balance: usdResponse.data.data?.balance || 0,
              status: 'active',
              lastActivity: new Date().toISOString()
            };
            
            const eurAccount = {
              accountNumber: '60429',
              accountType: 'EUR',
              externalAccountId: '60429',
              balance: eurResponse.data.data?.balance || 0,
              status: 'active',
              lastActivity: new Date().toISOString()
            };
            
            setAccounts([usdAccount, eurAccount]);
            
            // Buscar transações para ambas as contas
            const [usdTransactions, eurTransactions] = await Promise.all([
              axios.get('/api/ft-accounts/usd/transactions', config),
              axios.get('/api/ft-accounts/eur/transactions', config)
            ]);
            
            setTransactions({
              '60428': usdTransactions.data.data?.transactions || [],
              '60429': eurTransactions.data.data?.transactions || []
            });
          } catch (apiError) {
            console.error('Erro ao buscar dados da API FT, usando dados simulados:', apiError);
            
            // Se falhar, usar dados simulados
            setAccounts([mockFtAccounts.usd, mockFtAccounts.eur]);
            setTransactions(mockTransactions);
          }
        } else {
          // Para clientes normais, buscar suas contas pessoais
          await dispatch(fetchUserAccounts());
          
          if (userAccounts && userAccounts.length > 0) {
            setAccounts(userAccounts);
            
            // Buscar transações para cada conta
            const transactionsData = {};
            for (const account of userAccounts) {
              try {
                const response = await axios.get(`/api/accounts/${account.id}/transactions`, config);
                transactionsData[account.id] = response.data.data || [];
              } catch (err) {
                console.error(`Erro ao buscar transações para conta ${account.id}:`, err);
                transactionsData[account.id] = [];
              }
            }
            
            setTransactions(transactionsData);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar contas:', err);
        setError('Não foi possível carregar suas contas. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccounts();
  }, [dispatch, user, userAccounts]);
  
  // Função para atualizar dados
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Recarregar dados
      if (user?.role === 'admin') {
        // Recarregar dados da API FT para administradores
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        try {
          const [usdResponse, eurResponse] = await Promise.all([
            axios.get('/api/ft-accounts/usd', config),
            axios.get('/api/ft-accounts/eur', config)
          ]);
          
          const usdAccount = {
            accountNumber: '60428',
            accountType: 'USD',
            externalAccountId: '60428',
            balance: usdResponse.data.data?.balance || 0,
            status: 'active',
            lastActivity: new Date().toISOString()
          };
          
          const eurAccount = {
            accountNumber: '60429',
            accountType: 'EUR',
            externalAccountId: '60429',
            balance: eurResponse.data.data?.balance || 0,
            status: 'active',
            lastActivity: new Date().toISOString()
          };
          
          setAccounts([usdAccount, eurAccount]);
          
          // Buscar transações para ambas as contas
          const [usdTransactions, eurTransactions] = await Promise.all([
            axios.get('/api/ft-accounts/usd/transactions', config),
            axios.get('/api/ft-accounts/eur/transactions', config)
          ]);
          
          setTransactions({
            '60428': usdTransactions.data.data?.transactions || [],
            '60429': eurTransactions.data.data?.transactions || []
          });
        } catch (apiError) {
          console.error('Erro ao buscar dados da API FT, usando dados simulados:', apiError);
          // Se falhar, manter os dados atuais ou usar simulados
        }
      } else {
        // Recarregar contas para clientes normais
        await dispatch(fetchUserAccounts());
      }
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError('Não foi possível atualizar seus dados. Por favor, tente novamente mais tarde.');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Renderizar carregamento
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Renderizar erro
  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  // Formatar valor monetário
  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obter ícone para tipo de transação
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <TrendingUpIcon color="success" />;
      case 'WITHDRAWAL':
        return <TrendingDownIcon color="error" />;
      case 'TRANSFER':
        return <SwapHorizIcon color="primary" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Obter cor para tipo de transação
  const getTransactionColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'success';
      case 'WITHDRAWAL':
        return 'error';
      case 'TRANSFER':
        return 'primary';
      default:
        return 'info';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Minhas Contas
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </Box>
      
      {accounts.length === 0 ? (
        <Alert severity="info">
          Você não possui contas cadastradas. Entre em contato com o suporte para mais informações.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={6} key={account.accountNumber || account.id}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <AccountBalanceIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Conta {account.accountType || 'Corrente'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{account.accountNumber || account.id}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={account.status === 'active' ? 'Ativa' : 'Inativa'}
                      color={account.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {formatCurrency(account.balance, account.accountType)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Última atualização: {formatDate(account.lastActivity || new Date())}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Últimas Transações
                  </Typography>
                  
                  {transactions[account.accountNumber || account.id]?.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell align="right">Valor</TableCell>
                            <TableCell align="right">Data</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions[account.accountNumber || account.id]
                            .slice(0, 5)
                            .map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <Tooltip title={transaction.type}>
                                    {getTransactionIcon(transaction.type)}
                                  </Tooltip>
                                </TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell align="right" sx={{ color: transaction.amount >= 0 ? 'success.main' : 'error.main' }}>
                                  {formatCurrency(transaction.amount, transaction.currency || account.accountType)}
                                </TableCell>
                                <TableCell align="right">{formatDate(transaction.date)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Nenhuma transação encontrada para esta conta.
                    </Alert>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => {
                        // Navegar para página de extrato detalhado
                        console.log(`Ver extrato da conta ${account.accountNumber || account.id}`);
                      }}
                    >
                      Ver extrato completo
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyAccount;
