import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  CircularProgress
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
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus
} from '../../store/slices/accountSlice';

const AccountManagement = () => {
  const dispatch = useDispatch();
  const { accounts, loading, error } = useSelector((state) => state.accounts);
  
  // Estados locais
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // create, edit
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    holderName: '',
    accountType: 'USD',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dailyLimit: '',
    transactionLimit: ''
  });
  
  // Estado para erros do formulário
  const [formErrors, setFormErrors] = useState({});
  
  // Buscar contas ao montar o componente
  useEffect(() => {
    dispatch(fetchAccounts({ page, rowsPerPage, ...filters }));
  }, [dispatch, page, rowsPerPage, filters]);
  
  // Validar formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.holderName.trim()) {
      errors.holderName = 'Nome do titular é obrigatório';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Telefone é obrigatório';
    }
    
    if (!formData.dailyLimit || isNaN(formData.dailyLimit) || parseFloat(formData.dailyLimit) <= 0) {
      errors.dailyLimit = 'Limite diário inválido';
    }
    
    if (!formData.transactionLimit || isNaN(formData.transactionLimit) || parseFloat(formData.transactionLimit) <= 0) {
      errors.transactionLimit = 'Limite por transação inválido';
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
        holderName: account.holderName,
        accountType: account.accountType,
        email: account.email,
        phone: account.phone,
        address: account.address || '',
        city: account.city || '',
        state: account.state || '',
        zipCode: account.zipCode || '',
        dailyLimit: account.dailyLimit,
        transactionLimit: account.transactionLimit
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        holderName: '',
        accountType: 'USD',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        dailyLimit: '',
        transactionLimit: ''
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
          await dispatch(createAccount(formData)).unwrap();
        } else {
          await dispatch(updateAccount({ id: selectedAccount.id, ...formData })).unwrap();
        }
        handleCloseDialog();
        dispatch(fetchAccounts({ page, rowsPerPage, ...filters }));
      } catch (error) {
        // Erro é tratado pelo Redux
      }
    }
  };
  
  // Alternar status da conta
  const handleToggleStatus = async (account) => {
    try {
      await dispatch(toggleAccountStatus(account.id)).unwrap();
      dispatch(fetchAccounts({ page, rowsPerPage, ...filters }));
    } catch (error) {
      // Erro é tratado pelo Redux
    }
  };
  
  // Excluir conta
  const handleDelete = async (account) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await dispatch(deleteAccount(account.id)).unwrap();
        dispatch(fetchAccounts({ page, rowsPerPage, ...filters }));
      } catch (error) {
        // Erro é tratado pelo Redux
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
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Tipo"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
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
              >
                Exportar
              </Button>
              
              <IconButton
                color="primary"
                onClick={() => dispatch(fetchAccounts({ page, rowsPerPage, ...filters }))}
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
                <TableCell>Titular</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : accounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{account.holderName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {account.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.accountType}
                        color={account.accountType === 'USD' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(account.balance, account.accountType)}
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
                          <IconButton size="small" color="info">
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
          count={accounts?.totalCount || 0}
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
                label="Nome do Titular"
                name="holderName"
                value={formData.holderName}
                onChange={handleChange}
                error={!!formErrors.holderName}
                helperText={formErrors.holderName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Conta</InputLabel>
                <Select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  label="Tipo de Conta"
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="CEP"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
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
                      {formData.accountType}
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
                      {formData.accountType}
                    </InputAdornment>
                  ),
                }}
              />
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
    </Box>
  );
};

export default AccountManagement;
