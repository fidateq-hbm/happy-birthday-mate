"""
Currency Conversion Service
Handles currency conversion based on exchange rates
"""
import os
from typing import Dict, Optional
from decimal import Decimal
import httpx
from app.core.config import settings
import asyncio
from datetime import datetime, timedelta

# Cache for exchange rates (refresh every hour)
_exchange_rate_cache: Dict[str, Dict] = {}
_cache_timestamp: Optional[datetime] = None
CACHE_DURATION = timedelta(hours=1)


# Country to Currency Mapping
COUNTRY_TO_CURRENCY: Dict[str, str] = {
    # Africa
    "NG": "NGN",  # Nigeria
    "KE": "KES",  # Kenya
    "GH": "GHS",  # Ghana
    "ZA": "ZAR",  # South Africa
    "EG": "EGP",  # Egypt
    "TZ": "TZS",  # Tanzania
    "UG": "UGX",  # Uganda
    "ET": "ETB",  # Ethiopia
    "MA": "MAD",  # Morocco
    "DZ": "DZD",  # Algeria
    "TN": "TND",  # Tunisia
    "CM": "XAF",  # Cameroon
    "CI": "XOF",  # Côte d'Ivoire
    "SN": "XOF",  # Senegal
    "AO": "AOA",  # Angola
    "SD": "SDG",  # Sudan
    "MZ": "MZN",  # Mozambique
    "MG": "MGA",  # Madagascar
    "ML": "XOF",  # Mali
    "BF": "XOF",  # Burkina Faso
    "NE": "XOF",  # Niger
    "RW": "RWF",  # Rwanda
    "BJ": "XOF",  # Benin
    "TG": "XOF",  # Togo
    "GN": "GNF",  # Guinea
    "SL": "SLL",  # Sierra Leone
    "LR": "LRD",  # Liberia
    "TD": "XAF",  # Chad
    "CF": "XAF",  # Central African Republic
    "GA": "XAF",  # Gabon
    "CG": "XAF",  # Republic of the Congo
    "CD": "CDF",  # Democratic Republic of the Congo
    "ZM": "ZMW",  # Zambia
    "ZW": "USD",  # Zimbabwe (uses USD)
    "MW": "MWK",  # Malawi
    "LS": "LSL",  # Lesotho
    "BW": "BWP",  # Botswana
    "NA": "NAD",  # Namibia
    "SZ": "SZL",  # Eswatini
    "MU": "MUR",  # Mauritius
    "SC": "SCR",  # Seychelles
    "KM": "KMF",  # Comoros
    "DJ": "DJF",  # Djibouti
    "ER": "ERN",  # Eritrea
    "SO": "SOS",  # Somalia
    "SS": "SSP",  # South Sudan
    
    # Americas
    "US": "USD",  # United States
    "CA": "CAD",  # Canada
    "MX": "MXN",  # Mexico
    "BR": "BRL",  # Brazil
    "AR": "ARS",  # Argentina
    "CL": "CLP",  # Chile
    "CO": "COP",  # Colombia
    "PE": "PEN",  # Peru
    "VE": "VES",  # Venezuela
    "EC": "USD",  # Ecuador (uses USD)
    "BO": "BOB",  # Bolivia
    "PY": "PYG",  # Paraguay
    "UY": "UYU",  # Uruguay
    "GY": "GYD",  # Guyana
    "SR": "SRD",  # Suriname
    "GF": "EUR",  # French Guiana
    "FK": "FKP",  # Falkland Islands
    "GT": "GTQ",  # Guatemala
    "BZ": "BZD",  # Belize
    "SV": "USD",  # El Salvador (uses USD)
    "HN": "HNL",  # Honduras
    "NI": "NIO",  # Nicaragua
    "CR": "CRC",  # Costa Rica
    "PA": "PAB",  # Panama
    "CU": "CUP",  # Cuba
    "JM": "JMD",  # Jamaica
    "HT": "HTG",  # Haiti
    "DO": "DOP",  # Dominican Republic
    "PR": "USD",  # Puerto Rico (uses USD)
    "TT": "TTD",  # Trinidad and Tobago
    "BB": "BBD",  # Barbados
    "BS": "BSD",  # Bahamas
    "AG": "XCD",  # Antigua and Barbuda
    "DM": "XCD",  # Dominica
    "GD": "XCD",  # Grenada
    "KN": "XCD",  # Saint Kitts and Nevis
    "LC": "XCD",  # Saint Lucia
    "VC": "XCD",  # Saint Vincent and the Grenadines
    
    # Asia
    "CN": "CNY",  # China
    "JP": "JPY",  # Japan
    "IN": "INR",  # India
    "ID": "IDR",  # Indonesia
    "PK": "PKR",  # Pakistan
    "BD": "BDT",  # Bangladesh
    "PH": "PHP",  # Philippines
    "VN": "VND",  # Vietnam
    "TH": "THB",  # Thailand
    "MY": "MYR",  # Malaysia
    "SG": "SGD",  # Singapore
    "HK": "HKD",  # Hong Kong
    "TW": "TWD",  # Taiwan
    "KR": "KRW",  # South Korea
    "MM": "MMK",  # Myanmar
    "KH": "KHR",  # Cambodia
    "LA": "LAK",  # Laos
    "BN": "BND",  # Brunei
    "AF": "AFN",  # Afghanistan
    "IR": "IRR",  # Iran
    "IQ": "IQD",  # Iraq
    "SA": "SAR",  # Saudi Arabia
    "AE": "AED",  # United Arab Emirates
    "OM": "OMR",  # Oman
    "YE": "YER",  # Yemen
    "KW": "KWD",  # Kuwait
    "QA": "QAR",  # Qatar
    "BH": "BHD",  # Bahrain
    "JO": "JOD",  # Jordan
    "LB": "LBP",  # Lebanon
    "SY": "SYP",  # Syria
    "IL": "ILS",  # Israel
    "PS": "ILS",  # Palestine (uses ILS)
    "TR": "TRY",  # Turkey
    "GE": "GEL",  # Georgia
    "AM": "AMD",  # Armenia
    "AZ": "AZN",  # Azerbaijan
    "KZ": "KZT",  # Kazakhstan
    "UZ": "UZS",  # Uzbekistan
    "TM": "TMT",  # Turkmenistan
    "TJ": "TJS",  # Tajikistan
    "KG": "KGS",  # Kyrgyzstan
    "MN": "MNT",  # Mongolia
    "NP": "NPR",  # Nepal
    "BT": "BTN",  # Bhutan
    "LK": "LKR",  # Sri Lanka
    "MV": "MVR",  # Maldives
    
    # Europe
    "GB": "GBP",  # United Kingdom
    "IE": "EUR",  # Ireland
    "FR": "EUR",  # France
    "DE": "EUR",  # Germany
    "IT": "EUR",  # Italy
    "ES": "EUR",  # Spain
    "PT": "EUR",  # Portugal
    "NL": "EUR",  # Netherlands
    "BE": "EUR",  # Belgium
    "LU": "EUR",  # Luxembourg
    "AT": "EUR",  # Austria
    "FI": "EUR",  # Finland
    "GR": "EUR",  # Greece
    "CY": "EUR",  # Cyprus
    "MT": "EUR",  # Malta
    "SI": "EUR",  # Slovenia
    "SK": "EUR",  # Slovakia
    "EE": "EUR",  # Estonia
    "LV": "EUR",  # Latvia
    "LT": "EUR",  # Lithuania
    "PL": "PLN",  # Poland
    "CZ": "CZK",  # Czech Republic
    "HU": "HUF",  # Hungary
    "RO": "RON",  # Romania
    "BG": "BGN",  # Bulgaria
    "HR": "HRK",  # Croatia
    "RS": "RSD",  # Serbia
    "BA": "BAM",  # Bosnia and Herzegovina
    "MK": "MKD",  # North Macedonia
    "AL": "ALL",  # Albania
    "ME": "EUR",  # Montenegro (uses EUR)
    "XK": "EUR",  # Kosovo (uses EUR)
    "CH": "CHF",  # Switzerland
    "NO": "NOK",  # Norway
    "SE": "SEK",  # Sweden
    "DK": "DKK",  # Denmark
    "IS": "ISK",  # Iceland
    "RU": "RUB",  # Russia
    "UA": "UAH",  # Ukraine
    "BY": "BYN",  # Belarus
    "MD": "MDL",  # Moldova
    
    # Oceania
    "AU": "AUD",  # Australia
    "NZ": "NZD",  # New Zealand
    "PG": "PGK",  # Papua New Guinea
    "FJ": "FJD",  # Fiji
    "NC": "XPF",  # New Caledonia
    "PF": "XPF",  # French Polynesia
    "WS": "WST",  # Samoa
    "TO": "TOP",  # Tonga
    "VU": "VUV",  # Vanuatu
    "SB": "SBD",  # Solomon Islands
    "KI": "AUD",  # Kiribati (uses AUD)
    "TV": "AUD",  # Tuvalu (uses AUD)
    "NR": "AUD",  # Nauru (uses AUD)
    "PW": "USD",  # Palau (uses USD)
    "FM": "USD",  # Micronesia (uses USD)
    "MH": "USD",  # Marshall Islands (uses USD)
    
    # Default fallback
    "XX": "USD",  # Unknown/Default
}


class CurrencyService:
    """Service for currency conversion"""
    
    BASE_CURRENCY = "USD"  # All prices stored in USD
    
    @staticmethod
    def get_currency_from_country(country_code: str) -> str:
        """
        Get currency code from country code
        
        Args:
            country_code: ISO 3166-1 alpha-2 country code (e.g., "US", "NG", "GB")
            
        Returns:
            ISO 4217 currency code (e.g., "USD", "NGN", "GBP")
        """
        country_code = country_code.upper().strip()
        return COUNTRY_TO_CURRENCY.get(country_code, "USD")
    
    @staticmethod
    async def get_exchange_rates(base_currency: str = "USD") -> Dict[str, float]:
        """
        Fetch exchange rates from exchangerate-api.com (free tier)
        
        Args:
            base_currency: Base currency code (default: USD)
            
        Returns:
            Dictionary mapping currency codes to exchange rates
        """
        global _exchange_rate_cache, _cache_timestamp
        
        # Check cache
        if _cache_timestamp and datetime.now() - _cache_timestamp < CACHE_DURATION:
            if base_currency in _exchange_rate_cache:
                return _exchange_rate_cache[base_currency]
        
        try:
            # Use exchangerate-api.com (free tier, no API key required)
            url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                
                rates = data.get("rates", {})
                
                # Update cache
                _exchange_rate_cache[base_currency] = rates
                _cache_timestamp = datetime.now()
                
                return rates
                
        except Exception as e:
            print(f"Error fetching exchange rates: {str(e)}")
            # Return cached rates if available, or empty dict
            if base_currency in _exchange_rate_cache:
                return _exchange_rate_cache[base_currency]
            return {}
    
    @staticmethod
    async def convert_currency(
        amount: Decimal,
        from_currency: str,
        to_currency: str
    ) -> Decimal:
        """
        Convert amount from one currency to another
        
        Args:
            amount: Amount to convert
            from_currency: Source currency code
            to_currency: Target currency code
            
        Returns:
            Converted amount
        """
        if from_currency.upper() == to_currency.upper():
            return amount
        
        # Get exchange rates
        rates = await CurrencyService.get_exchange_rates(from_currency.upper())
        
        if not rates:
            # If we can't get rates, return original amount
            print(f"Warning: Could not fetch exchange rates. Returning original amount.")
            return amount
        
        # Get exchange rate
        rate = rates.get(to_currency.upper())
        
        if not rate:
            print(f"Warning: Exchange rate not found for {to_currency}. Returning original amount.")
            return amount
        
        # Convert amount
        converted_amount = amount * Decimal(str(rate))
        
        # Round to 2 decimal places
        return round(converted_amount, 2)
    
    @staticmethod
    async def get_user_currency(user_country: Optional[str]) -> str:
        """
        Get user's currency based on their country
        
        Args:
            user_country: User's country code or country name
            
        Returns:
            Currency code
        """
        if not user_country:
            return CurrencyService.BASE_CURRENCY
        
        # If it's already a currency code, return it
        if len(user_country) == 3 and user_country.isupper():
            return user_country
        
        # Try to extract country code from country name or code
        country_code = user_country.upper().strip()
        
        # If it's a 2-letter country code, use it directly
        if len(country_code) == 2:
            return CurrencyService.get_currency_from_country(country_code)
        
        # Try to map common country names to codes
        country_name_to_code = {
            "NIGERIA": "NG",
            "KENYA": "KE",
            "GHANA": "GH",
            "SOUTH AFRICA": "ZA",
            "UNITED STATES": "US",
            "USA": "US",
            "UNITED KINGDOM": "GB",
            "UK": "GB",
            "CANADA": "CA",
            "AUSTRALIA": "AU",
            "FRANCE": "FR",
            "GERMANY": "DE",
            "ITALY": "IT",
            "SPAIN": "ES",
            "BRAZIL": "BR",
            "INDIA": "IN",
            "CHINA": "CN",
            "JAPAN": "JP",
        }
        
        country_code = country_name_to_code.get(country_code, country_code[:2] if len(country_code) >= 2 else "XX")
        
        return CurrencyService.get_currency_from_country(country_code)

