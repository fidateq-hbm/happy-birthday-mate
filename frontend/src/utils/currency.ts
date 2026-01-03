/**
 * Currency formatting utilities
 */

// Currency symbols mapping
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  KES: 'KSh',
  GHS: 'GH₵',
  ZAR: 'R',
  EGP: 'E£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  PHP: '₱',
  THB: '฿',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  TRY: '₺',
  RUB: '₽',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  CHF: 'CHF',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  ISK: 'kr',
  ILS: '₪',
  AED: 'د.إ',
  SAR: '﷼',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: '.د.ب',
  OMR: '﷼',
  JOD: 'د.ا',
  LBP: '£',
  IQD: 'ع.د',
  IRR: '﷼',
  AFN: '؋',
  PKR: '₨',
  BDT: '৳',
  LKR: 'Rs',
  NPR: '₨',
  MMK: 'K',
  KHR: '៛',
  LAK: '₭',
  VND: '₫',
  IDR: 'Rp',
  MYR: 'RM',
  TWD: 'NT$',
  NZD: 'NZ$',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  UYU: '$U',
  PYG: '₲',
  BOB: 'Bs.',
  VES: 'Bs.',
  GTQ: 'Q',
  HNL: 'L',
  NIO: 'C$',
  CRC: '₡',
  PAB: 'B/.',
  CUP: '$',
  JMD: 'J$',
  HTG: 'G',
  DOP: 'RD$',
  TTD: 'TT$',
  BBD: 'Bds$',
  BSD: 'B$',
  XCD: '$',
  FJD: 'FJ$',
  PGK: 'K',
  WST: 'WS$',
  TOP: 'T$',
  VUV: 'Vt',
  SBD: 'SI$',
  XPF: '₣',
  MUR: '₨',
  SCR: '₨',
  KMF: 'CF',
  DJF: 'Fdj',
  ERN: 'Nfk',
  SOS: 'S',
  ETB: 'Br',
  TZS: 'TSh',
  UGX: 'USh',
  RWF: 'RF',
  BIF: 'FBu',
  MWK: 'MK',
  ZMW: 'ZK',
  AOA: 'Kz',
  MZN: 'MT',
  MGA: 'Ar',
  SLL: 'Le',
  LRD: 'L$',
  GNF: 'FG',
  XOF: 'CFA',
  XAF: 'FCFA',
  MAD: 'د.م.',
  DZD: 'د.ج',
  TND: 'د.ت',
  LYD: 'ل.د',
  SDG: 'ج.س.',
  SSP: '£',
  CDF: 'FC',
  GEL: '₾',
  AMD: '֏',
  AZN: '₼',
  KZT: '₸',
  UZS: 'so\'m',
  TMT: 'm',
  TJS: 'ЅМ',
  KGS: 'с',
  MNT: '₮',
  BYN: 'Br',
  MDL: 'lei',
  UAH: '₴',
  ALL: 'L',
  MKD: 'ден',
  BAM: 'КМ',
  RSD: 'дин',
  BWP: 'P',
  LSL: 'L',
  SZL: 'E',
  NAD: 'N$',
  ZWL: 'Z$',
};

/**
 * Format a price with currency symbol
 * @param amount - The price amount
 * @param currency - The currency code (e.g., 'USD', 'NGN', 'EUR')
 * @returns Formatted price string (e.g., '$10.00', '₦5,000.00')
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyUpper = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currencyUpper] || currencyUpper;
  
  // Format number with commas for thousands
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // For currencies that typically put symbol after (like EUR in some regions)
  // We'll use symbol before for consistency
  return `${symbol}${formattedAmount}`;
}

/**
 * Get currency symbol only
 * @param currency - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  const currencyUpper = currency.toUpperCase();
  return CURRENCY_SYMBOLS[currencyUpper] || currencyUpper;
}

/**
 * Format price for display (shorter format for small amounts)
 * @param amount - The price amount
 * @param currency - The currency code
 * @returns Formatted price string
 */
export function formatCurrencyShort(amount: number, currency: string = 'USD'): string {
  const currencyUpper = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currencyUpper] || currencyUpper;
  
  // For whole numbers, don't show decimals
  if (amount % 1 === 0) {
    const formattedAmount = new Intl.NumberFormat('en-US').format(amount);
    return `${symbol}${formattedAmount}`;
  }
  
  return formatCurrency(amount, currency);
}

