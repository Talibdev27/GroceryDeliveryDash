// Currency configuration for Diyor Market
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  exchangeRate?: number; // Exchange rate to USD for reference
}

export const CURRENCIES: Record<string, Currency> = {
  UZS: {
    code: 'UZS',
    symbol: 'сум',
    name: 'Uzbek Som',
    locale: 'uz-UZ',
    exchangeRate: 1 // Base currency
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 0.00008 // Approximate rate: 1 USD = 12,500 UZS
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    exchangeRate: 0.00009 // Approximate rate
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    locale: 'ru-RU',
    exchangeRate: 0.0009 // Approximate rate
  }
};

// Default currency for the application
export const DEFAULT_CURRENCY = 'UZS';

// Currency formatting functions
export function formatPrice(amount: number | string, currency: string = DEFAULT_CURRENCY): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const currencyConfig = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  
  if (isNaN(numAmount)) return `0 ${currencyConfig.symbol}`;
  
  // For Uzbek Som, format with spaces as thousands separators
  if (currency === 'UZS') {
    const formatted = new Intl.NumberFormat('uz-UZ').format(numAmount);
    return `${formatted} ${currencyConfig.symbol}`;
  }
  
  // For other currencies, use standard formatting
  return new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'UZS' ? 0 : 2,
    maximumFractionDigits: currency === 'UZS' ? 0 : 2
  }).format(numAmount);
}

// Convert between currencies
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string = DEFAULT_CURRENCY
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = CURRENCIES[fromCurrency]?.exchangeRate || 1;
  const toRate = CURRENCIES[toCurrency]?.exchangeRate || 1;
  
  // Convert to base currency (UZS) first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}

// Get currency symbol
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  return CURRENCIES[currency]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
}

// Get currency name
export function getCurrencyName(currency: string = DEFAULT_CURRENCY): string {
  return CURRENCIES[currency]?.name || CURRENCIES[DEFAULT_CURRENCY].name;
}
