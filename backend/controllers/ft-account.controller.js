/**
 * Controlador para gerenciar contas FT
 */
const FTApiService = require('../services/ftApi.service');
const LoggerService = require('../services/logger.service');

class FTAccountController {
  constructor() {
    this.logger = new LoggerService('FTAccountController');
  }
  
  /**
   * Obter dados da conta USD
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async getUSDAccount(req, res) {
    try {
      this.logger.info('Buscando dados da conta USD');
      const accountData = await FTApiService.getUSDAccountData();
      
      return res.status(200).json({
        status: 'success',
        data: accountData
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar dados da conta USD: ${error.message}`);
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar dados da conta USD',
        error: error.message
      });
    }
  }

  /**
   * Obter dados da conta EUR
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async getEURAccount(req, res) {
    try {
      this.logger.info('Buscando dados da conta EUR');
      const accountData = await FTApiService.getEURAccountData();
      
      return res.status(200).json({
        status: 'success',
        data: accountData
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar dados da conta EUR: ${error.message}`);
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar dados da conta EUR',
        error: error.message
      });
    }
  }

  /**
   * Obter dados de uma conta específica por número
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async getAccountByNumber(req, res) {
    try {
      const { accountNumber } = req.params;
      this.logger.info(`Buscando dados da conta ${accountNumber}`);
      
      // Verificar se é uma conta USD ou EUR
      if (accountNumber === process.env.USD_ACCOUNT) {
        const accountData = await FTApiService.getUSDAccountData();
        return res.status(200).json({
          status: 'success',
          data: accountData
        });
      } else if (accountNumber === process.env.EUR_ACCOUNT) {
        const accountData = await FTApiService.getEURAccountData();
        return res.status(200).json({
          status: 'success',
          data: accountData
        });
      } else {
        return res.status(404).json({
          status: 'error',
          message: `Conta ${accountNumber} não encontrada`
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao buscar dados da conta ${req.params.accountNumber}: ${error.message}`);
      
      return res.status(500).json({
        status: 'error',
        message: `Erro ao buscar dados da conta ${req.params.accountNumber}`,
        error: error.message
      });
    }
  }

  /**
   * Obter transações de uma conta específica
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async getAccountTransactions(req, res) {
    try {
      const { accountNumber } = req.params;
      this.logger.info(`Buscando transações da conta ${accountNumber}`);
      
      // Verificar se é uma conta USD ou EUR
      if (accountNumber === process.env.USD_ACCOUNT || accountNumber === process.env.EUR_ACCOUNT) {
        const transactionData = await FTApiService.getAccountTransactions(accountNumber);
        return res.status(200).json({
          status: 'success',
          data: transactionData
        });
      } else {
        return res.status(404).json({
          status: 'error',
          message: `Conta ${accountNumber} não encontrada`
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao buscar transações da conta ${req.params.accountNumber}: ${error.message}`);
      
      return res.status(500).json({
        status: 'error',
        message: `Erro ao buscar transações da conta ${req.params.accountNumber}`,
        error: error.message
      });
    }
  }

  /**
   * Obter transações da conta USD
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async getUSDAccountTransactions(req, res) {
    try {
      this.logger.info('Buscando transações da conta USD');
      const transactionData = await FTApiService.getAccountTransactions(process.env.USD_ACCOUNT);
      
      return res.status(200).json({
        status: 'success',
        data: transactionData
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar transações da conta USD: ${error.message}`);
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar transações da conta USD',
        error: error.message
      });
    }
  }

  /**
   * Obter transações da conta EUR
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async getEURAccountTransactions(req, res) {
    try {
      this.logger.info('Buscando transações da conta EUR');
      const transactionData = await FTApiService.getAccountTransactions(process.env.EUR_ACCOUNT);
      
      return res.status(200).json({
        status: 'success',
        data: transactionData
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar transações da conta EUR: ${error.message}`);
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar transações da conta EUR',
        error: error.message
      });
    }
  }
}

module.exports = new FTAccountController();
