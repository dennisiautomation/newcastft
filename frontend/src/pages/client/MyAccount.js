import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  AccountBalance, 
  CreditCard
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

const MyAccount = () => {
  const { user } = useSelector(state => state.auth);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Buscar dados das contas do cliente
    const fetchAccountData = async () => {
      try {
        // Obter o token do localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/client/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setAccounts(data.data.accountSummary.accounts || []);
        } else {
          setError(data.message || 'Erro ao carregar dados das contas');
        }
      } catch (err) {
        console.error('Erro ao buscar dados das contas:', err);
        setError('Não foi possível carregar os dados das contas. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Minhas Contas
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Detalhes das contas */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Detalhes das Contas
            </Typography>
            
            <Grid container spacing={3}>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <Grid item xs={12} md={6} key={account._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {account.currency === 'USD' ? (
                            <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                          ) : (
                            <CreditCard sx={{ mr: 1, color: 'info.main' }} />
                          )}
                          <Typography variant="h6">
                            Conta {account.currency}
                          </Typography>
                          <Chip 
                            label={account.status === 'active' ? 'Ativa' : 'Inativa'} 
                            color={account.status === 'active' ? 'success' : 'error'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <List dense>
                          <ListItem>
                            <ListItemText primary="Número da Conta" secondary={account.accountNumber} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Tipo" secondary={account.type} />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Saldo Atual" 
                              secondary={
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  {formatCurrency(account.balance, account.currency)}
                                </Typography>
                              } 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      Nenhuma conta encontrada
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {/* Informações do titular */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Titular
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemText primary="Nome" secondary={user?.name || 'Cliente Teste'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Empresa" secondary={user?.company || 'ERIYASU.CO.LTD'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Nacionalidade" secondary={user?.nationality || 'Japan'} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemText primary="Endereço" secondary={user?.address || '6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Telefone" secondary={user?.tel || '+81642563266'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Passaporte" secondary={user?.passport || 'TR8340146'} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default MyAccount;
