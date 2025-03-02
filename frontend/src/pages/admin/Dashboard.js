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
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  CompareArrows as CompareArrowsIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  ErrorOutline as ErrorOutlineIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { testApiConnections } from '../../store/slices/settingsSlice';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Componente de gráfico de linha
const LineChartComponent = ({ data, title }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ height: 300, p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="usd"
            name="USD"
            stroke={theme.palette.primary.main}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="eur"
            name="EUR"
            stroke={theme.palette.secondary.main}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Componente de gráfico de barras
const BarChartComponent = ({ data, title }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ height: 300, p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip />
          <Legend />
          <Bar dataKey="completed" name="Concluídas" fill={theme.palette.success.main} />
          <Bar dataKey="pending" name="Pendentes" fill={theme.palette.warning.main} />
          <Bar dataKey="failed" name="Falhas" fill={theme.palette.error.main} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Componente de caixa de resumo
const SummaryBox = ({ title, value, icon, color, secondaryText, actionText, onClick }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {}
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{secondaryText}</Typography>
      {actionText && (
        <Button 
          variant="text" 
          endIcon={<ArrowForwardIcon />} 
          sx={{ mt: 'auto', alignSelf: 'flex-start' }}
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
};

// Componente de status da API
const ApiStatus = ({ name, status, lastCheck, responseTime }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'degraded':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: `${getStatusColor()}.main` }}>
          <ApiIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={
          <>
            <Typography component="span" variant="body2" color="text.secondary">
              Última verificação: {lastCheck}
            </Typography>
            <br />
            <Typography component="span" variant="body2" color="text.secondary">
              Tempo de resposta: {responseTime}ms
            </Typography>
          </>
        }
      />
      <Chip
        label={status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Degradado'}
        color={getStatusColor()}
        size="small"
      />
    </ListItem>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { transactions, transactionStats, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const { accounts, totalAccounts, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { apiStatus, loading: apiLoading } = useSelector((state) => state.settings);
  
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadDashboardData();
  }, [dispatch]);
  
  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchTransactions({ limit: 5, sort: '-createdAt' })),
        dispatch(fetchAccounts({ limit: 5, sort: '-createdAt' })),
        dispatch(testApiConnections())
      ]);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Dados de exemplo para os gráficos
  const transactionTrends = [
    { name: 'Jan', usd: 4000, eur: 2400 },
    { name: 'Fev', usd: 3000, eur: 1398 },
    { name: 'Mar', usd: 2000, eur: 9800 },
    { name: 'Abr', usd: 2780, eur: 3908 },
    { name: 'Mai', usd: 1890, eur: 4800 },
    { name: 'Jun', usd: 2390, eur: 3800 },
    { name: 'Jul', usd: 3490, eur: 4300 }
  ];
  
  const transactionStatus = [
    { name: 'Jan', completed: 400, pending: 240, failed: 20 },
    { name: 'Fev', completed: 300, pending: 139, failed: 15 },
    { name: 'Mar', completed: 200, pending: 980, failed: 30 },
    { name: 'Abr', completed: 278, pending: 390, failed: 25 },
    { name: 'Mai', completed: 189, pending: 480, failed: 18 },
    { name: 'Jun', completed: 239, pending: 380, failed: 22 },
    { name: 'Jul', completed: 349, pending: 430, failed: 28 }
  ];
  
  // Status das APIs
  const apis = [
    {
      name: 'API de Reserva',
      status: 'online',
      lastCheck: '2 min atrás',
      responseTime: 150
    },
    {
      name: 'API de Confirmação',
      status: 'online',
      lastCheck: '3 min atrás',
      responseTime: 180
    },
    {
      name: 'API de Recebimento',
      status: 'degraded',
      lastCheck: '1 min atrás',
      responseTime: 450
    },
    {
      name: 'API de Envio',
      status: 'online',
      lastCheck: '4 min atrás',
      responseTime: 200
    }
  ];
  
  // Alertas de segurança
  const securityAlerts = [
    {
      id: 1,
      severity: 'error',
      message: 'Múltiplas tentativas de login falhas detectadas',
      time: '15 min atrás',
      icon: <ErrorOutlineIcon />,
      color: theme.palette.error.main
    },
    {
      id: 2,
      severity: 'warning',
      message: 'Transação de alto valor requer aprovação',
      time: '1 hora atrás',
      icon: <WarningIcon />,
      color: theme.palette.warning.main
    },
    {
      id: 3,
      severity: 'info',
      message: 'Nova conta criada aguardando verificação',
      time: '2 horas atrás',
      icon: <SecurityIcon />,
      color: theme.palette.info.main
    }
  ];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard Administrativo
        </Typography>
        
        <Tooltip title="Atualizar Dados">
          <IconButton onClick={loadDashboardData} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Métricas Principais */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox
            title="Total de Contas"
            value={totalAccounts || '0'}
            icon={<AccountBalanceIcon />}
            color={theme.palette.primary.main}
            secondaryText="Contas ativas no sistema"
            actionText="Ver Detalhes"
            onClick={() => navigate('/admin/accounts')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox
            title="Transações Hoje"
            value={transactionStats?.today || '0'}
            icon={<CompareArrowsIcon />}
            color={theme.palette.secondary.main}
            secondaryText="Volume total de transações"
            actionText="Ver Detalhes"
            onClick={() => navigate('/admin/transactions')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox
            title="Volume USD"
            value={`$${transactionStats?.volumeUSD || '0'}`}
            icon={<MonetizationOnIcon />}
            color={theme.palette.success.main}
            secondaryText="Volume total em USD"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox
            title="Volume EUR"
            value={`€${transactionStats?.volumeEUR || '0'}`}
            icon={<MonetizationOnIcon />}
            color={theme.palette.info.main}
            secondaryText="Volume total em EUR"
          />
        </Grid>
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <LineChartComponent
              data={transactionTrends}
              title="Volume de Transações por Moeda"
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <BarChartComponent
              data={transactionStatus}
              title="Status das Transações"
            />
          </Paper>
        </Grid>
      </Grid>
      
      {/* Status das APIs e Alertas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ p: 1 }}>
              Status das APIs
            </Typography>
            <List>
              {apis.map((api, index) => (
                <React.Fragment key={api.name}>
                  <ApiStatus {...api} />
                  {index < apis.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ p: 1 }}>
              Alertas de Segurança
            </Typography>
            <List>
              {securityAlerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alert.color }}>
                        {alert.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.message}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption">
                            {alert.time}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={
                        alert.severity === 'error'
                          ? 'Crítico'
                          : alert.severity === 'warning'
                          ? 'Atenção'
                          : 'Info'
                      }
                      color={alert.severity}
                      size="small"
                    />
                  </ListItem>
                  {index < securityAlerts.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
