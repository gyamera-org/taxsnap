export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  // Major World Currencies
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', flag: '🇨🇳' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH', flag: '🇨🇭' },

  // North America
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX', flag: '🇲🇽' },

  // South America
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', flag: '🇧🇷' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', locale: 'es-AR', flag: '🇦🇷' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', locale: 'es-CL', flag: '🇨🇱' },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso', locale: 'es-CO', flag: '🇨🇴' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', locale: 'es-PE', flag: '🇵🇪' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', locale: 'es-UY', flag: '🇺🇾' },
  { code: 'VES', symbol: 'Bs', name: 'Venezuelan Bolívar', locale: 'es-VE', flag: '🇻🇪' },

  // Europe
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO', flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK', flag: '🇩🇰' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL', flag: '🇵🇱' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ', flag: '🇨🇿' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU', flag: '🇭🇺' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO', flag: '🇷🇴' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', locale: 'bg-BG', flag: '🇧🇬' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', locale: 'hr-HR', flag: '🇭🇷' },
  { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar', locale: 'sr-RS', flag: '🇷🇸' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', locale: 'uk-UA', flag: '🇺🇦' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU', flag: '🇷🇺' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR', flag: '🇹🇷' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna', locale: 'is-IS', flag: '🇮🇸' },

  // Asia Pacific
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', flag: '🇦🇺' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', flag: '🇳🇿' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', flag: '🇮🇳' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', flag: '🇰🇷' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK', flag: '🇭🇰' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW', flag: '🇹🇼' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', flag: '🇹🇭' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', flag: '🇲🇾' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', flag: '🇮🇩' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', flag: '🇵🇭' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', flag: '🇻🇳' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK', flag: '🇵🇰' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD', flag: '🇧🇩' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', locale: 'si-LK', flag: '🇱🇰' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', locale: 'ne-NP', flag: '🇳🇵' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', locale: 'my-MM', flag: '🇲🇲' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', locale: 'km-KH', flag: '🇰🇭' },

  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA', flag: '🇸🇦' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', locale: 'ar-QA', flag: '🇶🇦' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW', flag: '🇰🇼' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', locale: 'ar-BH', flag: '🇧🇭' },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', locale: 'ar-OM', flag: '🇴🇲' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', locale: 'ar-JO', flag: '🇯🇴' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL', flag: '🇮🇱' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG', flag: '🇪🇬' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', locale: 'ar-LB', flag: '🇱🇧' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', locale: 'ar-IQ', flag: '🇮🇶' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', locale: 'fa-IR', flag: '🇮🇷' },

  // Africa
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', flag: '🇿🇦' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG', flag: '🇳🇬' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', flag: '🇰🇪' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH', flag: '🇬🇭' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', locale: 'en-UG', flag: '🇺🇬' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', locale: 'sw-TZ', flag: '🇹🇿' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', locale: 'am-ET', flag: '🇪🇹' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', locale: 'ar-MA', flag: '🇲🇦' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar', locale: 'ar-DZ', flag: '🇩🇿' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', locale: 'ar-TN', flag: '🇹🇳' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', locale: 'fr-SN', flag: '🇸🇳' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', locale: 'fr-CM', flag: '🇨🇲' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', locale: 'rw-RW', flag: '🇷🇼' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', locale: 'en-ZM', flag: '🇿🇲' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula', locale: 'en-BW', flag: '🇧🇼' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', locale: 'en-MU', flag: '🇲🇺' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar', locale: 'en-NA', flag: '🇳🇦' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', locale: 'pt-MZ', flag: '🇲🇿' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', locale: 'pt-AO', flag: '🇦🇴' },

  // Caribbean & Central America
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar', locale: 'en-JM', flag: '🇯🇲' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad Dollar', locale: 'en-TT', flag: '🇹🇹' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar', locale: 'en-BB', flag: '🇧🇧' },
  { code: 'BSD', symbol: 'B$', name: 'Bahamian Dollar', locale: 'en-BS', flag: '🇧🇸' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', locale: 'es-DO', flag: '🇩🇴' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', locale: 'es-CR', flag: '🇨🇷' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', locale: 'es-GT', flag: '🇬🇹' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', locale: 'es-HN', flag: '🇭🇳' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', locale: 'es-PA', flag: '🇵🇦' },
  { code: 'CUP', symbol: '₱', name: 'Cuban Peso', locale: 'es-CU', flag: '🇨🇺' },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde', locale: 'fr-HT', flag: '🇭🇹' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // USD
