import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { transferService } from '../../services/api';

// API base URL
const API_URL = '/api/transactions';

// Async thunk for executing a transfer
export const executeTransfer = createAsyncThunk(
  'transactions/transfer',
  async (transferData, { rejectWithValue }) => {
    try {
      const result = await transferService.executeTransfer(transferData);
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to execute transfer');
      }
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to execute transfer');
    }
  }
);

// Async thunk for fetching all transactions (admin)
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transactions'
      );
    }
  }
);

// Async thunk for fetching account transactions
export const fetchAccountTransactions = createAsyncThunk(
  'transactions/fetchByAccount',
  async ({ accountId, params }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/account/${accountId}`, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch account transactions'
      );
    }
  }
);

// Async thunk for fetching user transactions (client)
export const fetchUserTransactions = createAsyncThunk(
  'transactions/fetchUserTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/user`, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user transactions'
      );
    }
  }
);

// Async thunk for fetching transaction details
export const fetchTransactionDetails = createAsyncThunk(
  'transactions/fetchDetails',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${transactionId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transaction details'
      );
    }
  }
);

// Async thunk for initiating a transaction (client)
export const initiateTransaction = createAsyncThunk(
  'transactions/initiate',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/initiate`, transactionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to initiate transaction'
      );
    }
  }
);

// Async thunk for confirming a transaction (client)
export const confirmTransaction = createAsyncThunk(
  'transactions/confirm',
  async ({ transactionId, confirmationData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${transactionId}/confirm`, confirmationData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to confirm transaction'
      );
    }
  }
);

// Async thunk for cancelling a transaction (client or admin)
export const cancelTransaction = createAsyncThunk(
  'transactions/cancel',
  async ({ transactionId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${transactionId}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel transaction'
      );
    }
  }
);

// Initial state
const initialState = {
  transactions: [],
  accountTransactions: [],
  userTransactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  totalTransactions: 0,
  pagination: {
    page: 1,
    limit: 10,
  },
  transactionStats: {
    daily: [],
    weekly: [],
    monthly: [],
  },
  transferStatus: null,
};

// Create transaction slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    clearTransferStatus: (state) => {
      state.transferStatus = null;
    },
  },
  extraReducers: (builder) => {
    // Execute transfer
    builder.addCase(executeTransfer.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.transferStatus = 'pending';
    });
    builder.addCase(executeTransfer.fulfilled, (state, action) => {
      state.loading = false;
      state.transferStatus = 'completed';
      state.userTransactions.unshift(action.payload.details);
    });
    builder.addCase(executeTransfer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.transferStatus = 'failed';
    });

    // Fetch all transactions
    builder.addCase(fetchTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = action.payload.transactions;
      state.totalTransactions = action.payload.total;
      
      if (action.payload.stats) {
        state.transactionStats = action.payload.stats;
      }
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch account transactions
    builder.addCase(fetchAccountTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAccountTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.accountTransactions = action.payload.transactions;
    });
    builder.addCase(fetchAccountTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch user transactions
    builder.addCase(fetchUserTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.userTransactions = action.payload.transactions;
    });
    builder.addCase(fetchUserTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch transaction details
    builder.addCase(fetchTransactionDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTransactionDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTransaction = action.payload;
    });
    builder.addCase(fetchTransactionDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Initiate transaction
    builder.addCase(initiateTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(initiateTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTransaction = action.payload;
    });
    builder.addCase(initiateTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Confirm transaction
    builder.addCase(confirmTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(confirmTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTransaction = action.payload;
      
      // Update transaction in lists if present
      const updateTransaction = (list) => {
        const index = list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          list[index] = action.payload;
        }
      };
      
      updateTransaction(state.transactions);
      updateTransaction(state.accountTransactions);
      updateTransaction(state.userTransactions);
    });
    builder.addCase(confirmTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Cancel transaction
    builder.addCase(cancelTransaction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTransaction = action.payload;
      
      // Update transaction in lists if present
      const updateTransaction = (list) => {
        const index = list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          list[index] = action.payload;
        }
      };
      
      updateTransaction(state.transactions);
      updateTransaction(state.accountTransactions);
      updateTransaction(state.userTransactions);
    });
    builder.addCase(cancelTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { 
  clearTransactionError, 
  setCurrentTransaction, 
  clearCurrentTransaction,
  setPagination,
  clearTransferStatus,
} = transactionSlice.actions;

export default transactionSlice.reducer;
