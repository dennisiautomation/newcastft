import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const MyAccount = () => {
  const { user } = useSelector(state => state.auth);
  
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Detalhes da Conta
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Informações Bancárias
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Número da Conta" 
                    secondary={user?.accountInfo?.accountNumber || "778908"} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Tipo de Conta" 
                    secondary={user?.accountInfo?.type || "Conta Corporativa"} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Moeda Principal" 
                    secondary="USD" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Data de Abertura" 
                    secondary="01/01/2023" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Status" 
                    secondary="Ativo" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Limites da Conta
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Limite de Transferência Diária" 
                    secondary="USD 50,000.00" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Limite de Transferência Internacional" 
                    secondary="USD 25,000.00" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Limite de Saques" 
                    secondary="USD 5,000.00" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Limite de Cartão de Crédito" 
                    secondary="USD 10,000.00" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Dados do Titular
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText 
                        primary="Nome Completo" 
                        secondary={user?.name || "SHIGEMI MATSUMOTO"} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText 
                        primary="Email" 
                        secondary={user?.email || "shigemi.matsumoto@newcashbank.com.br"} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText 
                        primary="Empresa" 
                        secondary={user?.companyInfo?.name || "ERIYASU.CO.LTD"} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText 
                        primary="Número de Identificação" 
                        secondary={user?.documentId || "1200-01-233046"} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText 
                        primary="País" 
                        secondary={user?.companyInfo?.country || "JAPAN"} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText 
                        primary="Telefone" 
                        secondary={user?.phone || "+81 6-6251-1881"} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyAccount;
