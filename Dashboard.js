import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Grid, Paper, Typography, Button, Box, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Link } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const BalanceAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.8rem',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {user && (
        <Box mb={3}>
          <Typography variant="h4">Olá, {user.name}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Bem-vindo ao seu painel de controle.
          </Typography>
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Account Balance Summary */}
        <Grid item xs={12} md={4}>
          <StyledPaper elevation={2}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Saldo da Conta</Typography>
            </Box>
            <BalanceAmount color="primary">USD 0.00</BalanceAmount>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Atualizado em: {new Date().toLocaleDateString()}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button 
              component={Link} 
              to="/client/transactions"
              variant="outlined" 
              color="primary" 
              startIcon={<ReceiptLongIcon />}
              fullWidth
            >
              Ver Extrato
            </Button>
          </StyledPaper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <StyledPaper elevation={2}>
            <Typography variant="h6" gutterBottom>Ações Rápidas</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link}
                  to="/client/transfers"
                  variant="contained" 
                  color="primary"
                  startIcon={<SwapHorizIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Nova Transferência
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link}
                  to="/client/my-account"
                  variant="outlined"
                  startIcon={<AccountBalanceWalletIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Detalhes da Conta
                </Button>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <StyledPaper elevation={2}>
            <Box display="flex" alignItems="center" mb={2}>
              <ReceiptLongIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Últimas Transações</Typography>
            </Box>
            <Box textAlign="center" py={3}>
              <Typography variant="body1" color="textSecondary">
                Não há transações recentes para exibir.
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Sua última transação: USD 0.00
              </Typography>
            </Box>
            <Button 
              component={Link}
              to="/client/transactions"
              variant="text" 
              color="primary"
              fullWidth
            >
              Ver Todas as Transações
            </Button>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
