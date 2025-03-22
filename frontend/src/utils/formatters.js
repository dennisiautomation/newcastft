/**
 * Utilitários para formatação de valores
 */

/**
 * Formata um valor numérico como moeda
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Código da moeda (USD, EUR, etc)
 * @param {string} locale - Localidade para formatação (padrão: pt-BR)
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value, currency = 'USD', locale = 'pt-BR') => {
  // Garantir que o valor é um número
  const numericValue = Number(value);
  
  if (isNaN(numericValue)) {
    return '0,00';
  }
  
  // Mapear códigos de moeda para símbolos
  const currencyMap = {
    'USD': 'USD',
    'EUR': 'EUR',
    'BRL': 'R$'
  };
  
  // Usar o Intl.NumberFormat para formatação consistente
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

/**
 * Formata uma data para exibição
 * @param {Date|string} date - Data a ser formatada
 * @param {string} format - Formato desejado (short, medium, long)
 * @param {string} locale - Localidade para formatação (padrão: pt-BR)
 * @returns {string} Data formatada
 */
export const formatDate = (date, format = 'medium', locale = 'pt-BR') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      medium: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
      long: { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }
    };
    
    return dateObj.toLocaleDateString(locale, options[format] || options.medium);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return String(date);
  }
};

/**
 * Formata um número com separadores de milhar
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @param {string} locale - Localidade para formatação (padrão: pt-BR)
 * @returns {string} Número formatado
 */
export const formatNumber = (value, decimals = 2, locale = 'pt-BR') => {
  // Garantir que o valor é um número
  const numericValue = Number(value);
  
  if (isNaN(numericValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue);
};

/**
 * Formata um valor percentual
 * @param {number} value - Valor a ser formatado (ex: 0.25 para 25%)
 * @param {number} decimals - Número de casas decimais
 * @param {string} locale - Localidade para formatação (padrão: pt-BR)
 * @returns {string} Percentual formatado
 */
export const formatPercent = (value, decimals = 2, locale = 'pt-BR') => {
  // Garantir que o valor é um número
  const numericValue = Number(value);
  
  if (isNaN(numericValue)) {
    return '0%';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue);
};
