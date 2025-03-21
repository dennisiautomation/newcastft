import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  error: null,
  loading: false,
  welcomeMessage: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, user, welcomeMessage } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.user = user;
      state.loading = false;
      state.error = null;
      state.welcomeMessage = welcomeMessage || '';
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    updatePasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  updateProfileSuccess,
  updatePasswordSuccess
} = authSlice.actions;

// Mock login action para desenvolvimento offline
export const mockLogin = (credentials) => (dispatch) => {
  dispatch(loginStart());
  
  try {
    console.log("Tentando login com:", credentials.email);
    
    // Credenciais específicas para cliente e admin
    if (credentials.email === 'admin@newcashbank.com.br' && credentials.password === 'admin123') {
      // Admin login
      const token = 'mock-jwt-token-admin';
      const user = {
        id: 'admin-001',
        email: 'admin@newcashbank.com.br',
        name: 'ADMINISTRATOR',
        role: 'ADMIN'
      };
      
      console.log("Login de admin aceito");
      
      // Simulação de delay de rede (500ms)
      setTimeout(() => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch(loginSuccess({
          token,
          user,
          welcomeMessage: `Bem-vindo(a), ${user.name}`,
        }));
      }, 500);
      
      return;
    } 
    else if (credentials.email === 'shigemi.matsumoto@newcashbank.com.br' && credentials.password === 'Eriyasu2023!') {
      // Cliente login
      const token = 'mock-jwt-token-client';
      const user = {
        id: 'client-002',
        email: 'shigemi.matsumoto@newcashbank.com.br',
        name: 'SHIGEMI MATSUMOTO',
        role: 'CLIENT'
      };
      
      console.log("Login de cliente aceito");
      
      // Simulação de delay de rede (500ms)
      setTimeout(() => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch(loginSuccess({
          token,
          user,
          welcomeMessage: `Bem-vindo(a), ${user.name}`,
        }));
      }, 500);
      
      return;
    }
    
    console.log("Login falhou: credenciais inválidas");
    dispatch(loginFailure('Credenciais inválidas'));
  } catch (error) {
    console.error("Erro no login:", error);
    dispatch(loginFailure(error.message));
  }
};

// Função para verificar o status de autenticação
export const checkAuthStatus = () => (dispatch) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  if (token && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      
      dispatch(loginSuccess({
        token,
        user,
        welcomeMessage: '',
      }));
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Função para atualizar o perfil do usuário
export const updateProfile = (profileData) => (dispatch) => {
  try {
    // Em um ambiente real, isso enviaria uma solicitação para atualizar os dados
    // Aqui apenas simulamos a atualização com sucesso
    dispatch(updateProfileSuccess(profileData));
    return { success: true };
  } catch (error) {
    dispatch(loginFailure(error.message));
    return { success: false, error: error.message };
  }
};

// Função para atualizar a senha do usuário
export const updatePassword = (passwordData) => (dispatch) => {
  dispatch(loginStart());
  try {
    // Em um ambiente real, isso enviaria uma solicitação para atualizar a senha
    // Aqui apenas simulamos a atualização com sucesso
    setTimeout(() => {
      dispatch(updatePasswordSuccess());
    }, 500);
    return { success: true, message: 'Senha atualizada com sucesso!' };
  } catch (error) {
    dispatch(loginFailure(error.message));
    return { success: false, error: error.message };
  }
};

export default authSlice.reducer;
