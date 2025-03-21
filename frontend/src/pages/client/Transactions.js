import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as DownloadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Dados de exemplo para transações
  const mockTransactions = [];
  
  // Filtrar transações com base no termo de pesquisa e tipo de filtro
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && transaction.type === filterType;
  });
  
  // Mostrar todos em uma página para facilitar visualização
  const paginatedTransactions = filteredTransactions;
  
  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Determinar a cor do chip com base no tipo de transação
  const getChipColor = (type) => {
    return type === 'credit' ? 'success' : 'error';
  };
  
  // Formatar valor monetário para exibição
  const formatCurrency = (amount, currency) => {
    return `${currency} ${Math.abs(amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Histórico de Transações
      </Typography>
      
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por descrição ou referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por tipo</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filtrar por tipo"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="credit">Entradas</MenuItem>
                  <MenuItem value="debit">Saídas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={12} md={5} textAlign="right">
              <IconButton color="primary" title="Exportar transações">
                <DownloadIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: 'black' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Referência</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                hover
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.reference}</TableCell>
                <TableCell>
                  <Chip 
                    label={transaction.type === 'credit' ? 'Entrada' : 'Saída'} 
                    color={getChipColor(transaction.type)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 'bold',
                  color: transaction.type === 'credit' ? 'green' : 'red'
                }}>
                  {transaction.type === 'credit' ? '+' : '-'} 
                  {formatCurrency(transaction.amount, transaction.currency)}
                </TableCell>
              </TableRow>
            ))}
            
            {paginatedTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    Nenhuma transação encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Transactions;
