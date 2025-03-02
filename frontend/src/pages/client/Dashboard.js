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
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { useNavigate } from 'react-router-dom';

// Account Card Component
const AccountCard = ({ account, onViewTransactions }) => {
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
        <MenuItem onClick={() => { handleMenuClose(); onViewTransactions(account.id); }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Transactions</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ReceiptLongIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Statement</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <CreditCardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Account</ListItemText>
        </MenuItem>
      </Menu>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
          {formatCurrency(account.balance)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Available Balance
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary" 
              startIcon={<SendToMobileIcon />}
              onClick={() => {}}
            >
              Transfer
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => {}}
            >
              Deposit
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { accounts, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchAccounts());
    dispatch(fetchTransactions({ limit: 10, sort: '-date' }));
  }, [dispatch]);
  
  // Handle view transactions
  const handleViewTransactions = (accountId) => {
    navigate(`/client/transactions?accountId=${accountId}`);
  };
  
  // Sample account data (in case the Redux store doesn't have real data yet)
  const sampleAccounts = [
    {
      id: '1',
      accountName: 'Primary Checking',
      accountNumber: '1234567890',
      balance: 5672.83,
      type: 'checking',
      currency: 'USD'
    },
    {
      id: '2',
      accountName: 'Savings Account',
      accountNumber: '0987654321',
      balance: 12500.50,
      type: 'savings',
      currency: 'USD'
    },
    {
      id: '3',
      accountName: 'Investment Account',
      accountNumber: '5678901234',
      balance: 75420.18,
      type: 'investment',
      currency: 'USD'
    }
  ];
  
  // Sample transaction data (in case the Redux store doesn't have real data yet)
  const sampleTransactions = [
    {
      id: 't1',
      type: 'deposit',
      amount: '$1,500.00',
      from: 'Direct Deposit - ABC Corp',
      to: 'Primary Checking',
      status: 'completed',
      date: '2023-05-20T10:30:00Z'
    },
    {
      id: 't2',
      type: 'withdrawal',
      amount: '$200.00',
      from: 'Primary Checking',
      to: 'ATM Withdrawal',
      status: 'completed',
      date: '2023-05-19T15:45:00Z'
    },
    {
      id: 't3',
      type: 'transfer',
      amount: '$500.00',
      from: 'Primary Checking',
      to: 'Savings Account',
      status: 'completed',
      date: '2023-05-18T09:15:00Z'
    },
    {
      id: 't4',
      type: 'payment',
      amount: '$75.50',
      from: 'Primary Checking',
      to: 'Electric Company',
      status: 'pending',
      date: '2023-05-17T14:20:00Z'
    },
    {
      id: 't5',
      type: 'deposit',
      amount: '$100.00',
      from: 'Mobile Deposit',
      to: 'Savings Account',
      status: 'completed',
      date: '2023-05-16T11:10:00Z'
    }
  ];
  
  // Use real data if available, otherwise use sample data
  const displayAccounts = accounts && accounts.length > 0 ? accounts : sampleAccounts;
  const displayTransactions = transactions && transactions.length > 0 ? transactions : sampleTransactions;
  
  // Format the user's name
  const getUserName = () => {
    if (user && user.firstName) {
      return `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;
    }
    return 'Valued Customer';
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {getUserName()}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's an overview of your finances
        </Typography>
      </Box>
      
      {/* Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Total Balance" 
            value="$93,593.51"
            icon={<AccountBalanceIcon />}
            color={theme.palette.primary.main}
            trend="up"
            trendValue="3.5% from last month"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Income" 
            value="$4,250.00"
            icon={<TrendingUpIcon />}
            color={theme.palette.success.main}
            trend="up"
            trendValue="$250.00 more than last month"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Expenses" 
            value="$2,150.35"
            icon={<TrendingDownIcon />}
            color={theme.palette.error.main}
            trend="down"
            trendValue="$120.45 less than last month"
          />
        </Grid>
      </Grid>
      
      {/* Accounts Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Your Accounts</Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => {}}
          >
            Add New Account
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {accountsLoading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Grid>
          ) : (
            displayAccounts.map((account) => (
              <Grid item xs={12} md={4} key={account.id}>
                <AccountCard account={account} onViewTransactions={handleViewTransactions} />
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      
      {/* Recent Transactions */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Recent Transactions</Typography>
          <Button 
            variant="text" 
            color="primary" 
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/client/transactions')}
          >
            View All Transactions
          </Button>
        </Box>
        
        <Paper elevation={2}>
          <TransactionList 
            transactions={displayTransactions} 
            loading={transactionsLoading} 
          />
        </Paper>
      </Box>
      
      {/* Quick Actions */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Quick Actions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                borderColor: theme.palette.primary.light,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(0, 102, 204, 0.04)'
                }
              }}
              onClick={() => {}}
            >
              <SendToMobileIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2">Transfer Funds</Typography>
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                borderColor: theme.palette.primary.light,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(0, 102, 204, 0.04)'
                }
              }}
              onClick={() => {}}
            >
              <PaymentIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2">Pay Bills</Typography>
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                borderColor: theme.palette.primary.light,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(0, 102, 204, 0.04)'
                }
              }}
              onClick={() => {}}
            >
              <ReceiptLongIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2">View Statements</Typography>
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                borderColor: theme.palette.primary.light,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(0, 102, 204, 0.04)'
                }
              }}
              onClick={() => {}}
            >
              <CreditCardIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2">Manage Cards</Typography>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ClientDashboard;
