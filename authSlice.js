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
    logout: (state) => {
      return initialState;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// Mock login action para desenvolvimento offline
export const mockLogin = (credentials) => (dispatch) => {
  dispatch(loginStart());
  
  try {
    // Simulação de verificação de credenciais para testes offline
    if (
      (credentials.email === 'admin@newcashbank.com.br' && credentials.password === 'admin123') ||
      (credentials.email === 'shigemi.matsumoto@newcashbank.com.br' && credentials.password === 'Eriyasu2023!')
    ) {
      const role = credentials.email.includes('admin') ? 'ADMIN' : 'CLIENT';
      const name = credentials.email.includes('admin') 
        ? 'ADMINISTRATOR' 
        : 'SHIGEMI MATSUMOTO';
      
      const token = 'mock-jwt-token';
      const user = {
        id: role === 'ADMIN' ? 'admin-001' : 'client-002',
        email: credentials.email,
        name: name,
        role: role,
      };
      
      // Simulação de delay de rede (500ms)
      setTimeout(() => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch(loginSuccess({
          token,
          user,
          welcomeMessage: `Bem-vindo(a), ${name}`,
        }));
      }, 500);
      
      return;
    }
    
    dispatch(loginFailure('Login failed'));
  } catch (error) {
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

export default authSlice.reducer;
