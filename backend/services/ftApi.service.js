const axios = require('axios');
const LoggerService = require('./logger.service');

class FTApiService {
  constructor() {
    this.baseUrl = process.env.FT_API_BASE_URL || 'http://mytest.ftassetmanagement.com/api';
    this.apiKey = process.env.FT_API_KEY || '6d9bac1b-f685-11ef-a3af-00155d010b18';
    this.usdAccount = process.env.USD_ACCOUNT || '60428';
    this.eurAccount = process.env.EUR_ACCOUNT || '60429';

    // Initialize axios instance with common configuration
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        const requestInfo = {
          method: config.method.toUpperCase(),
          url: config.url,
          data: config.data,
          params: config.params
        };
        console.info(`FT API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`FT API Request Error: ${error.message}`);
        LoggerService.logSystemError(error, { 
          source: 'FT API Request',
          context: 'Request Interceptor' 
        });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.info(`FT API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`FT API Response Error: ${error.response.status} ${error.response.statusText}`);
          console.error(`Error Data: ${JSON.stringify(error.response.data)}`);
          LoggerService.logSystemError(error, { 
            source: 'FT API Response',
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
        } else if (error.request) {
          console.error(`FT API No Response: ${error.request}`);
          LoggerService.logSystemError(error, { 
            source: 'FT API Response',
            context: 'No Response',
            request: error.request
          });
        } else {
          console.error(`FT API Error: ${error.message}`);
          LoggerService.logSystemError(error, { 
            source: 'FT API Error',
            context: 'General Error'
          });
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get reservations for an account
   * @param {string} account - Account number (optional)
   * @param {string} reservationCode - Reservation code (optional)
   * @returns {Promise<Object>} Reservation data
   */
  async getReservations(account, reservationCode) {
    const startTime = Date.now();
    try {
      let url = `/Reservation.asp?key=${this.apiKey}`;
      
      if (account) {
        url += `&account=${account}`;
      } else if (reservationCode) {
        url += `&Reservation=${reservationCode}`;
      } else {
        throw new Error('Either account or reservation code must be provided');
      }

      const response = await this.api.get(url);
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET /Reservation.asp',
        { account, reservationCode },
        response.data,
        response.status,
        responseTime
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error getting reservations: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET /Reservation.asp',
        { account, reservationCode },
        error.response?.data || {},
        error.response?.status || 500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Get USD account reservations
   * @returns {Promise<Object>} USD account reservations
   */
  async getUsdReservations() {
    return this.getReservations(this.usdAccount);
  }

  /**
   * Get EUR account reservations
   * @returns {Promise<Object>} EUR account reservations
   */
  async getEurReservations() {
    return this.getReservations(this.eurAccount);
  }

  /**
   * Get specific reservation by code
   * @param {string} reservationCode - Reservation code
   * @returns {Promise<Object>} Reservation details
   */
  async getReservationByCode(reservationCode) {
    return this.getReservations(null, reservationCode);
  }

  /**
   * Confirm a reservation
   * @param {Object} confirmationData - Confirmation data in JSON format
   * @returns {Promise<Object>} Confirmation response
   */
  async confirmReservation(confirmationData) {
    const startTime = Date.now();
    try {
      const url = `/Reservation_confirmation.asp`;
      
      // Ensure required fields are present
      if (!confirmationData.reservationCode) {
        throw new Error('Reservation code is required');
      }

      // Add API key to the data
      const data = {
        ...confirmationData,
        key: this.apiKey
      };

      const response = await this.api.post(url, data);
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'POST /Reservation_confirmation.asp',
        data,
        response.data,
        response.status,
        responseTime
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error confirming reservation: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'POST /Reservation_confirmation.asp',
        confirmationData,
        error.response?.data || {},
        error.response?.status || 500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Check for incoming transfers
   * @returns {Promise<Object>} Incoming transfers data
   */
  async checkIncomingTransfers() {
    const startTime = Date.now();
    try {
      const url = `/receiving.asp?key=${this.apiKey}`;
      const response = await this.api.get(url);
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET /receiving.asp',
        { key: this.apiKey },
        response.data,
        response.status,
        responseTime
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error checking incoming transfers: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET /receiving.asp',
        { key: this.apiKey },
        error.response?.data || {},
        error.response?.status || 500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Send a transfer to another financial entity
   * @param {Object} transferData - Transfer data in JSON format
   * @returns {Promise<Object>} Transfer response
   */
  async sendTransfer(transferData) {
    const startTime = Date.now();
    try {
      const url = `/send.asp?key=${this.apiKey}`;
      
      // Ensure required fields are present
      if (!transferData.amount || !transferData.currency || !transferData.destinationAccount) {
        throw new Error('Amount, currency, and destination account are required');
      }

      const response = await this.api.post(url, transferData);
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'POST /send.asp',
        { ...transferData, key: this.apiKey },
        response.data,
        response.status,
        responseTime
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error sending transfer: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'POST /send.asp',
        { ...transferData, key: this.apiKey },
        error.response?.data || {},
        error.response?.status || 500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Get USD account data
   * @returns {Promise<Object>} USD account data
   */
  async getUSDAccountData() {
    const startTime = Date.now();
    try {
      // Obter reservas da conta USD para extrair saldo
      const reservationData = await this.getUsdReservations();
      
      // Extrair saldo e outras informações relevantes
      const accountData = {
        accountNumber: this.usdAccount,
        balance: reservationData.balance || 0,
        currency: 'USD',
        status: 'active',
        lastUpdated: new Date().toISOString()
      };
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET USD Account Data',
        { account: this.usdAccount },
        accountData,
        200,
        responseTime
      );
      
      return accountData;
    } catch (error) {
      console.error(`Error getting USD account data: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET USD Account Data',
        { account: this.usdAccount },
        {},
        500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Get EUR account data
   * @returns {Promise<Object>} EUR account data
   */
  async getEURAccountData() {
    const startTime = Date.now();
    try {
      // Obter reservas da conta EUR para extrair saldo
      const reservationData = await this.getEurReservations();
      
      // Extrair saldo e outras informações relevantes
      const accountData = {
        accountNumber: this.eurAccount,
        balance: reservationData.balance || 0,
        currency: 'EUR',
        status: 'active',
        lastUpdated: new Date().toISOString()
      };
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET EUR Account Data',
        { account: this.eurAccount },
        accountData,
        200,
        responseTime
      );
      
      return accountData;
    } catch (error) {
      console.error(`Error getting EUR account data: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET EUR Account Data',
        { account: this.eurAccount },
        {},
        500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Get account transactions
   * @param {string} accountNumber - Account number
   * @returns {Promise<Object>} Transaction data
   */
  async getAccountTransactions(accountNumber) {
    const startTime = Date.now();
    try {
      // Verificar qual conta está sendo consultada
      const isUsdAccount = accountNumber === this.usdAccount;
      const isEurAccount = accountNumber === this.eurAccount;
      
      if (!isUsdAccount && !isEurAccount) {
        throw new Error(`Invalid account number: ${accountNumber}`);
      }
      
      // Obter reservas da conta para extrair transações
      const reservationData = isUsdAccount 
        ? await this.getUsdReservations() 
        : await this.getEurReservations();
      
      // Processar dados de transações
      const transactions = this.processTransactionsFromReservations(reservationData, isUsdAccount ? 'USD' : 'EUR');
      
      const transactionData = {
        accountNumber,
        currency: isUsdAccount ? 'USD' : 'EUR',
        transactions
      };
      
      // Log successful API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET Account Transactions',
        { account: accountNumber },
        { transactionCount: transactions.length },
        200,
        responseTime
      );
      
      return transactionData;
    } catch (error) {
      console.error(`Error getting account transactions: ${error.message}`);
      
      // Log failed API call
      const responseTime = Date.now() - startTime;
      LoggerService.logApiCall(
        'GET Account Transactions',
        { account: accountNumber },
        {},
        500,
        responseTime,
        error
      );
      
      throw error;
    }
  }

  /**
   * Process transactions from reservation data
   * @param {Object} reservationData - Reservation data
   * @param {string} currency - Currency code (USD or EUR)
   * @returns {Array} Processed transactions
   */
  processTransactionsFromReservations(reservationData, currency) {
    if (!reservationData || !reservationData.reservations || !Array.isArray(reservationData.reservations)) {
      return [];
    }
    
    // Mapear reservas para o formato de transações
    return reservationData.reservations.map((reservation, index) => {
      const isPositive = reservation.type === 'receive' || reservation.type === 'confirmation';
      
      return {
        id: reservation.id || reservation.code || `trans-${Date.now()}-${index}`,
        type: this.mapReservationTypeToTransactionType(reservation.type),
        amount: isPositive ? Math.abs(reservation.amount || 0) : -Math.abs(reservation.amount || 0),
        date: reservation.date || new Date().toISOString(),
        description: reservation.description || `${this.capitalizeFirstLetter(reservation.type || 'Transaction')} - ${reservation.code || ''}`,
        status: reservation.status || 'completed',
        currency
      };
    });
  }

  /**
   * Map reservation type to transaction type
   * @param {string} reservationType - Reservation type
   * @returns {string} Transaction type
   */
  mapReservationTypeToTransactionType(reservationType) {
    if (!reservationType) return 'TRANSFER';
    
    const typeMap = {
      'deposit': 'DEPOSIT',
      'withdrawal': 'WITHDRAWAL',
      'transfer': 'TRANSFER',
      'payment': 'PAYMENT',
      'reservation': 'WITHDRAWAL',
      'confirmation': 'DEPOSIT',
      'receive': 'DEPOSIT'
    };
    
    return typeMap[reservationType.toLowerCase()] || 'TRANSFER';
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = new FTApiService();
