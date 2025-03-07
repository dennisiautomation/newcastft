import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Tooltip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

const AccountManagement = () => {
  // Dados estáticos em vez de usar o Redux
  const [accounts, setAccounts] = useState([
    { 
      id: 'ACC-001', 
      accountNumber: '60428',
      userId: 1,
      userName: 'Administrador',
      userEmail: 'admin@newcashbank.com.br',
      balance: 5000.00,
      currency: 'USD',
      status: 'active',
      createdAt: '2025-01-15'
    },
    { 
      id: 'ACC-002', 
      accountNumber: '60429',
      userId: 1,
      userName: 'Administrador',
      userEmail: 'admin@newcashbank.com.br',
      balance: 15000.00,
      currency: 'EUR',
      status: 'active',
      createdAt: '2025-02-01'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Snackbar para feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estados locais
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // create, edit
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    accountNumber: '',
    initialDeposit: '0',
    dailyLimit: '5000',
    transactionLimit: '2000',
    initialPassword: '',
    sendPasswordEmail: true
  });
  
  // Estado para erros do formulário
  const [formErrors, setFormErrors] = useState({});
  
  // Validar formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.accountNumber.trim()) {
      errors.accountNumber = 'Número da conta é obrigatório';
    }
    
    if (!formData.initialDeposit || isNaN(formData.initialDeposit) || parseFloat(formData.initialDeposit) < 0) {
      errors.initialDeposit = 'Depósito inicial inválido';
    }
    
    if (!formData.dailyLimit || isNaN(formData.dailyLimit) || parseFloat(formData.dailyLimit) <= 0) {
      errors.dailyLimit = 'Limite diário inválido';
    }
    
    if (!formData.transactionLimit || isNaN(formData.transactionLimit) || parseFloat(formData.transactionLimit) <= 0) {
      errors.transactionLimit = 'Limite por transação inválido';
    }
    
    if (!formData.initialPassword.trim()) {
      errors.initialPassword = 'Senha inicial é obrigatória';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Manipular mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Abrir diálogo para criar/editar conta
  const handleOpenDialog = (mode, account = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && account) {
      setSelectedAccount(account);
      setFormData({
        accountNumber: account.accountNumber,
        initialDeposit: account.balance,
        dailyLimit: '5000',
        transactionLimit: '2000',
        initialPassword: '',
        sendPasswordEmail: true
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        accountNumber: '',
        initialDeposit: '0',
        dailyLimit: '5000',
        transactionLimit: '2000',
        initialPassword: '',
        sendPasswordEmail: true
      });
    }
    setOpenDialog(true);
  };
  
  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };
  
  // Salvar conta
  const handleSave = async () => {
    if (validateForm()) {
      try {
        if (dialogMode === 'create') {
          // Simular a criação de uma nova conta
          const newAccount = {
            id: `ACC-${accounts.length + 1}`,
            accountNumber: formData.accountNumber,
            userId: 2,
            userName: '',
            userEmail: '',
            balance: parseFloat(formData.initialDeposit),
            currency: 'BRL',
            status: 'active',
            createdAt: new Date().toISOString()
          };
          setAccounts(prev => [...prev, newAccount]);
          setSnackbar({
            open: true,
            message: 'Conta criada com sucesso!',
            severity: 'success'
          });
        } else {
          // Simular a edição de uma conta existente
          const index = accounts.findIndex(account => account.id === selectedAccount.id);
          if (index !== -1) {
            accounts[index] = {
              ...accounts[index],
              accountNumber: formData.accountNumber,
              balance: parseFloat(formData.initialDeposit)
            };
            setAccounts([...accounts]);
            setSnackbar({
              open: true,
              message: 'Conta editada com sucesso!',
              severity: 'success'
            });
          }
        }
        handleCloseDialog();
      } catch (error) {
        setError(error.message);
        setSnackbar({
          open: true,
          message: 'Erro ao salvar conta!',
          severity: 'error'
        });
      }
    }
  };
  
  // Alternar status da conta
  const handleToggleStatus = async (account) => {
    try {
      const index = accounts.findIndex(acc => acc.id === account.id);
      if (index !== -1) {
        accounts[index].status = account.status === 'active' ? 'inactive' : 'active';
        setAccounts([...accounts]);
        setSnackbar({
          open: true,
          message: 'Status da conta alterado com sucesso!',
          severity: 'success'
        });
      }
    } catch (error) {
      setError(error.message);
      setSnackbar({
        open: true,
        message: 'Erro ao alterar status da conta!',
        severity: 'error'
      });
    }
  };
  
  // Excluir conta
  const handleDelete = async (account) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        const index = accounts.findIndex(acc => acc.id === account.id);
        if (index !== -1) {
          accounts.splice(index, 1);
          setAccounts([...accounts]);
          setSnackbar({
            open: true,
            message: 'Conta excluída com sucesso!',
            severity: 'success'
          });
        }
      } catch (error) {
        setError(error.message);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir conta!',
          severity: 'error'
        });
      }
    }
  };
  
  // Manipular mudança de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Manipular mudança de linhas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Manipular mudança de filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };
  
  // Atualizar a tabela
  const handleRefresh = () => {
    setRefreshing(true);
    // Simular uma chamada de API
    setTimeout(() => {
      setRefreshing(false);
      setSnackbar({
        open: true,
        message: 'Dados atualizados com sucesso!',
        severity: 'success'
      });
    }, 1500);
  };
  
  // Exportar contas
  const handleExport = () => {
    setSnackbar({
      open: true,
      message: 'Arquivo exportado com sucesso!',
      severity: 'success'
    });
  };
  
  // Visualizar histórico da conta
  const handleViewHistory = (account) => {
    setSnackbar({
      open: true,
      message: `Exibindo histórico da conta ${account.accountNumber}`,
      severity: 'info'
    });
    
    // Em uma implementação real, abriria um modal ou redirecionaria para uma página de histórico
    console.log(`Histórico da conta ${account.accountNumber}`);
  };
  
  // Formatar moeda
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Contas
      </Typography>
      
      {/* Barra de Ferramentas */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, email ou número da conta"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativos</MenuItem>
                <MenuItem value="inactive">Inativos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Nova Conta
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Exportar
              </Button>
              
              <IconButton
                color="primary"
                onClick={handleRefresh}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Lista de Contas */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número da Conta</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refreshing ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : accounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">Nenhuma conta encontrada</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tente ajustar os filtros ou criar uma nova conta
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                accounts?.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(account.balance, account.currency)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.status === 'active' ? 'Ativo' : 'Inativo'}
                        color={account.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Histórico">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleViewHistory(account)}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog('edit', account)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={account.status === 'active' ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            color={account.status === 'active' ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(account)}
                          >
                            {account.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(account)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={accounts?.length || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Itens por página"
        />
      </Paper>
      
      {/* Diálogo de Criar/Editar Conta */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Criar Nova Conta' : 'Editar Conta'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número da Conta"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Depósito Inicial"
                name="initialDeposit"
                type="number"
                value={formData.initialDeposit}
                onChange={handleChange}
                error={!!formErrors.initialDeposit}
                helperText={formErrors.initialDeposit}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      R$
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Limite Diário"
                name="dailyLimit"
                type="number"
                value={formData.dailyLimit}
                onChange={handleChange}
                error={!!formErrors.dailyLimit}
                helperText={formErrors.dailyLimit}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      R$
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Limite por Transação"
                name="transactionLimit"
                type="number"
                value={formData.transactionLimit}
                onChange={handleChange}
                error={!!formErrors.transactionLimit}
                helperText={formErrors.transactionLimit}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      R$
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senha Inicial"
                name="initialPassword"
                type="password"
                value={formData.initialPassword}
                onChange={handleChange}
                error={!!formErrors.initialPassword}
                helperText={formErrors.initialPassword}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Enviar senha por email</InputLabel>
                <Select
                  name="sendPasswordEmail"
                  value={formData.sendPasswordEmail}
                  onChange={handleChange}
                  label="Enviar senha por email"
                >
                  <MenuItem value={true}>Sim</MenuItem>
                  <MenuItem value={false}>Não</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSave}
            loading={loading}
          >
            {dialogMode === 'create' ? 'Criar' : 'Salvar'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountManagement;
