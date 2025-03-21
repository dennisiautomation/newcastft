import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const Transfers = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [transferData, setTransferData] = useState({
    accountNumber: '',
    bankCode: '',
    beneficiaryName: '',
    amount: '',
    description: '',
    transferType: 'domestic'
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const steps = ['Detalhes da Transferência', 'Revisão', 'Confirmação'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro específico quando o usuário digitar no campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!transferData.accountNumber) newErrors.accountNumber = 'Número da conta é obrigatório';
      if (!transferData.bankCode) newErrors.bankCode = 'Código do banco é obrigatório';
      if (!transferData.beneficiaryName) newErrors.beneficiaryName = 'Nome do beneficiário é obrigatório';
      if (!transferData.amount) {
        newErrors.amount = 'Valor da transferência é obrigatório';
      } else if (isNaN(transferData.amount) || parseFloat(transferData.amount) <= 0) {
        newErrors.amount = 'Informe um valor válido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        // Simular o envio da transferência
        setShowSuccess(true);
        setTimeout(() => {
          // Reiniciar formulário após 3 segundos
          setActiveStep(0);
          setTransferData({
            accountNumber: '',
            bankCode: '',
            beneficiaryName: '',
            amount: '',
            description: '',
            transferType: 'domestic'
          });
          setShowSuccess(false);
        }, 3000);
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Transferência</InputLabel>
                <Select
                  name="transferType"
                  value={transferData.transferType}
                  onChange={handleChange}
                >
                  <MenuItem value="domestic">Transferência Doméstica</MenuItem>
                  <MenuItem value="international">Transferência Internacional</MenuItem>
                  <MenuItem value="internal">Transferência Entre Contas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número da Conta"
                name="accountNumber"
                value={transferData.accountNumber}
                onChange={handleChange}
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código do Banco"
                name="bankCode"
                value={transferData.bankCode}
                onChange={handleChange}
                error={!!errors.bankCode}
                helperText={errors.bankCode}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Beneficiário"
                name="beneficiaryName"
                value={transferData.beneficiaryName}
                onChange={handleChange}
                error={!!errors.beneficiaryName}
                helperText={errors.beneficiaryName}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                name="amount"
                value={transferData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">USD</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição (opcional)"
                name="description"
                value={transferData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box mt={2}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Por favor, revise as informações da transferência antes de confirmar.
            </Alert>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Tipo de Transferência
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {transferData.transferType === 'domestic' 
                        ? 'Transferência Doméstica' 
                        : transferData.transferType === 'international' 
                          ? 'Transferência Internacional' 
                          : 'Transferência Entre Contas'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Valor da Transferência
                    </Typography>
                    <Typography variant="body1" gutterBottom fontWeight="bold">
                      USD {parseFloat(transferData.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Número da Conta
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {transferData.accountNumber}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Código do Banco
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {transferData.bankCode}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Nome do Beneficiário
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {transferData.beneficiaryName}
                    </Typography>
                  </Grid>
                  
                  {transferData.description && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Descrição
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {transferData.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );
      case 2:
        return (
          <Box mt={3} display="flex" flexDirection="column" alignItems="center">
            {showSuccess ? (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                Transferência realizada com sucesso!
              </Alert>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Confirme a transferência
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                  Ao clicar em "Confirmar", você autoriza a transferência de:
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">
                  USD {parseFloat(transferData.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                  para {transferData.beneficiaryName}
                </Typography>
              </>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Transferência de Fundos
      </Typography>
      
      <Card elevation={3}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderStepContent(activeStep)}
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Voltar
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={showSuccess}
            >
              {activeStep === steps.length - 1 ? 'Confirmar' : 'Próximo'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Transfers;
