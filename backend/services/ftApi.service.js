const axios = require('axios');
const logger = require('../utils/logger');

class FTApiService {
  constructor() {
    this.baseUrl = process.env.FT_API_BASE_URL || 'http://mytest.ftassetmanagement.com/api';
    this.apiKey = process.env.FT_API_KEY || '6d9bac1b-f685-11ef-a3af-00155d010b18';
    this.usdAccount = process.env.USD_ACCOUNT || '42226';
    this.eurAccount = process.env.EUR_ACCOUNT || '42227';

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
        logger.info(`FT API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`FT API Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        logger.info(`FT API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`FT API Response Error: ${error.response.status} ${error.response.statusText}`);
          logger.error(`Error Data: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          logger.error(`FT API No Response: ${error.request}`);
        } else {
          logger.error(`FT API Error: ${error.message}`);
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
      return response.data;
    } catch (error) {
      logger.error(`Error getting reservations: ${error.message}`);
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
      return response.data;
    } catch (error) {
      logger.error(`Error confirming reservation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check for incoming transfers
   * @returns {Promise<Object>} Incoming transfers data
   */
  async checkIncomingTransfers() {
    try {
      const url = `/receiving.asp?key=${this.apiKey}`;
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      logger.error(`Error checking incoming transfers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a transfer to another financial entity
   * @param {Object} transferData - Transfer data in JSON format
   * @returns {Promise<Object>} Transfer response
   */
  async sendTransfer(transferData) {
    try {
      const url = `/send.asp?key=${this.apiKey}`;
      
      // Ensure required fields are present
      if (!transferData.amount || !transferData.currency || !transferData.destinationAccount) {
        throw new Error('Amount, currency, and destination account are required');
      }

      const response = await this.api.post(url, transferData);
      return response.data;
    } catch (error) {
      logger.error(`Error sending transfer: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FTApiService();
