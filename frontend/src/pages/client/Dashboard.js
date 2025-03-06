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
import { fetchTransactions } from '../../store/slices/transactionSlice';
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
    return new Intl.NumberFormat('en-US', {
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
      default:
        return <PaymentIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
                  {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}{transaction.amount}
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accounts, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions({ limit: 5 }));
  }, [dispatch]);
  
  // Handle view transactions
  const handleViewTransactions = (accountId) => {
    navigate(`/client/transactions?accountId=${accountId}`);
  };
  
  // Handle view account details
  const handleViewAccount = (accountId) => {
    navigate(`/client/accounts/${accountId}`);
  };
  
  // Handle view statement
  const handleViewStatement = (accountId) => {
    navigate(`/client/statements/accounts/${accountId}`);
  };
  
  // Handle view financial summary
  const handleViewFinancialSummary = () => {
    navigate('/client/statements/summary');
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button 
          variant="outlined" 
          startIcon={<AssessmentIcon />}
          onClick={handleViewFinancialSummary}
        >
          Resumo Financeiro
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              bgcolor: theme.palette.primary.main, 
              color: 'white',
              borderRadius: 2
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  Bem-vindo(a) de volta, {user?.firstName || 'Cliente'}!
                </Typography>
                <Typography variant="body1">
                  Aqui está um resumo das suas finanças. Veja suas contas, transações recentes e gerencie suas finanças.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<ReceiptLongIcon />}
                  onClick={handleViewFinancialSummary}
                  sx={{ 
                    bgcolor: 'white', 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.grey[100]
                    }
                  }}
                >
                  Ver Resumo Completo
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Account Summary Section */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Suas Contas</Typography>
            <Button 
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/client/accounts')}
            >
              Ver Todas
            </Button>
          </Box>
          
          {accountsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : accounts && accounts.length > 0 ? (
            <Grid container spacing={3}>
              {accounts.map((account) => (
                <Grid item xs={12} sm={6} md={4} key={account.id}>
                  <AccountCard 
                    account={account} 
                    onViewTransactions={handleViewTransactions}
                    onViewStatement={handleViewStatement}
                    onViewAccount={handleViewAccount}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nenhuma conta encontrada
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ações Rápidas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem button onClick={() => navigate('/client/transfer')}>
                <ListItemIcon>
                  <CompareArrowsIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Nova Transferência" />
              </ListItem>
              
              <ListItem button onClick={() => navigate('/client/transactions')}>
                <ListItemIcon>
                  <AccessTimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Histórico de Transações" />
              </ListItem>
              
              <ListItem button onClick={handleViewFinancialSummary}>
                <ListItemIcon>
                  <AssessmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Resumo Financeiro" />
              </ListItem>
              
              <ListItem button onClick={() => navigate('/client/profile')}>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Meus Dados" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Transações Recentes
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/client/transactions')}
              >
                Ver Todas
              </Button>
            </Box>
            <TransactionList 
              transactions={transactions} 
              loading={transactionsLoading} 
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;
