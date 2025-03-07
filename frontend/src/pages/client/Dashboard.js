import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Avatar,
  useTheme,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  CompareArrows as CompareArrowsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  SendToMobile as SendToMobileIcon,
  Visibility as VisibilityIcon,
  ReceiptLong as ReceiptLongIcon,
  CreditCard as CreditCardIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { fetchUserTransactions } from '../../store/slices/transactionSlice';
import { fetchSecurityLogs } from '../../store/slices/securitySlice';
import { useNavigate } from 'react-router-dom';

// Account Card Component
const AccountCard = ({ account, onViewTransactions, onViewStatement, onViewAccount }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <AccountBalanceIcon />
          </Avatar>
        }
        action={
          <IconButton aria-label="settings" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        }
        title={account.accountName || 'Account'}
        subheader={`Account # ${account.accountNumber}`}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); onViewAccount(account.id); }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Detalhes da Conta</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); onViewTransactions(account.id); }}>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Histórico de Transações</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); onViewStatement(account.id); }}>
          <ListItemIcon>
            <ReceiptLongIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Extrato Bancário</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); window.open(`/client/statements/accounts/${account.id}/pdf`, '_blank'); }}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Baixar Extrato PDF</ListItemText>
        </MenuItem>
      </Menu>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
          {formatCurrency(account.balance)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Saldo Disponível
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary" 
              startIcon={<SendToMobileIcon />}
              onClick={() => onViewAccount(account.id)}
            >
              Transferir
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              startIcon={<VisibilityIcon />}
              onClick={() => onViewAccount(account.id)}
            >
              Detalhes
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Transaction List Component
const TransactionList = ({ transactions, loading }) => {
  const theme = useTheme();
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Helper function to get transaction type icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'withdrawal':
        return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
      case 'transfer':
        return <CompareArrowsIcon sx={{ color: theme.palette.info.main }} />;
      case 'receive':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'reservation':
        return <AccessTimeIcon sx={{ color: theme.palette.warning.main }} />;
      case 'confirmation':
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <PaymentIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Format amount with positive/negative indicator and currency
  const formatAmount = (amount, type) => {
    const isNegative = 
      type === 'withdrawal' || 
      type === 'transfer' || 
      (amount < 0);
    
    let displayAmount = isNegative ? amount * -1 : amount;
    if (isNegative && amount > 0) displayAmount = amount * -1;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(displayAmount);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No transactions found
        </Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Transaction</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTransactionIcon(transaction.type)}
                  <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                    {transaction.type}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>
                <Typography variant="body2">
                  {transaction.from} {transaction.type === 'transfer' ? '→' : ''} {transaction.to}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: transaction.type === 'deposit' 
                      ? theme.palette.success.main 
                      : transaction.type === 'withdrawal' 
                        ? theme.palette.error.main 
                        : 'inherit'
                  }}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Chip 
                  label={transaction.status}
                  color={getStatusColor(transaction.status)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Security Log Component
const SecurityLogList = ({ logs, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Nenhuma atividade de segurança recente encontrada.
        </Typography>
      </Box>
    );
  }

  // Helper function to get color for activity type
  const getActivityColor = (status) => {
    switch (status) {
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  // Helper function to get friendly action name
  const getActionName = (actionType) => {
    const actionMap = {
      'login': 'Login',
      'logout': 'Logout',
      'login_failed': 'Tentativa de login',
      'transfer_initiated': 'Transferência iniciada',
      'transfer_completed': 'Transferência concluída',
      'transfer_failed': 'Transferência falhou',
      'profile_updated': 'Perfil atualizado',
      'password_changed': 'Senha alterada',
      'password_reset': 'Redefinição de senha',
      'account_created': 'Conta criada',
      'view_transactions': 'Visualização de transações',
      'view_account': 'Visualização de conta'
    };
    return actionMap[actionType] || actionType;
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {logs.slice(0, 5).map((log) => (
        <ListItem
          key={log._id}
          alignItems="flex-start"
          sx={{ 
            borderLeft: `4px solid ${getActivityColor(log.status)}`,
            mb: 1,
            borderRadius: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <ListItemText
            primary={getActionName(log.actionType)}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </Typography>
                {log.details && 
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                    {typeof log.details === 'string' ? log.details : 'Detalhes indisponíveis'}
                  </Typography>
                }
              </React.Fragment>
            }
          />
          <Chip 
            label={log.status}
            size="small"
            color={getActivityColor(log.status)}
            sx={{ ml: 1 }}
          />
        </ListItem>
      ))}
    </List>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, color, trend, trendValue }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ bgcolor: color, mr: 2, width: 40, height: 40 }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>{value}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {trend === 'up' ? (
          <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 18 }} />
        ) : (
          <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 18 }} />
        )}
        <Typography 
          variant="body2" 
          color={trend === 'up' ? 'success.main' : 'error.main'}
        >
          {trendValue}
        </Typography>
      </Box>
    </Paper>
  );
};

const ClientDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { accounts, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const { logs, loading: logsLoading } = useSelector((state) => state.security || { logs: [], loading: false });
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchUserTransactions({ limit: 10 }));
    dispatch(fetchSecurityLogs({ limit: 5 }));
  }, [dispatch]);
  
  // Navigation handlers
  const handleViewAccount = (accountId) => {
    navigate(`/accounts/${accountId}`);
  };
  
  const handleViewTransactions = (accountId) => {
    navigate(`/transactions${accountId ? `?accountId=${accountId}` : ''}`);
  };
  
  const handleViewStatement = (accountId) => {
    navigate(`/statements/accounts/${accountId}`);
  };
  
  // Calculate summary data for accounts
  const getTotalBalance = () => {
    if (!accounts || accounts.length === 0) return 0;
    return accounts.reduce((total, account) => total + account.balance, 0);
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      {/* Logo e Welcome Message */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: '#000000', 
          borderRadius: 2,
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center', 
          width: '100%' 
        }}>
          <Box sx={{ 
            mr: { xs: 0, md: 4 }, 
            mb: { xs: 2, md: 0 },
            textAlign: 'center'
          }}>
            <img 
              src="/assets/images/logo.png" 
              alt="NewCash Bank Logo" 
              style={{ 
                height: '150px', 
                maxWidth: '100%',
                filter: 'brightness(1.2) contrast(1.3) invert(1)'
              }} 
            />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Olá, {user?.firstName || 'Cliente'}!
            </Typography>
            <Typography variant="body1">
              Bem-vindo ao NewCash Bank. Confira seu resumo financeiro abaixo.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Saldo Total"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'USD',
            }).format(getTotalBalance())}
            icon={<AccountBalanceIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Transações este mês"
            value={transactions?.length || 0}
            icon={<PaymentIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Reservas Ativas"
            value={0}
            icon={<AssessmentIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Segurança"
            value="Protegido"
            icon={<InfoIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>
      
      {/* Accounts and Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Minhas Contas
          </Typography>
          {accountsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {accounts && accounts.length > 0 ? (
                accounts.map((account) => (
                  <Grid item xs={12} sm={6} key={account.id || account._id}>
                    <AccountCard
                      account={account}
                      onViewAccount={handleViewAccount}
                      onViewTransactions={handleViewTransactions}
                      onViewStatement={handleViewStatement}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Você não possui contas ativas.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                    >
                      Abrir Nova Conta
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ações Rápidas
          </Typography>
          <Paper sx={{ p: 3, height: '100%' }}>
            <List>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SendToMobileIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                  onClick={() => navigate('/transfers')}
                >
                  Realizar Transferência
                </Button>
              </ListItem>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                  onClick={() => navigate('/statements')}
                >
                  Ver Extrato
                </Button>
              </ListItem>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CreditCardIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                  onClick={() => navigate('/reservations')}
                >
                  Realizar Reserva
                </Button>
              </ListItem>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                  onClick={() => navigate('/security')}
                >
                  Verificar Segurança
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Transactions and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader 
              title="Transações Recentes" 
              action={
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleViewTransactions()}
                >
                  Ver Todas
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <TransactionList 
                transactions={transactions} 
                loading={transactionsLoading} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader 
              title="Atividades de Segurança" 
              action={
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/security')}
                >
                  Ver Todas
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <SecurityLogList 
                logs={logs}
                loading={logsLoading}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;
