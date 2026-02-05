// Mapping country names to ISO 3166-1 alpha-2 codes
// Includes French names, English names, and common variants
export const countryNameToCode = {
  // Europe
  'France': 'FR',
  'Allemagne': 'DE',
  'Germany': 'DE',
  'Espagne': 'ES',
  'Spain': 'ES',
  'Italie': 'IT',
  'Italy': 'IT',
  'Royaume-Uni': 'GB',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Angleterre': 'GB',
  'England': 'GB',
  'Grande-Bretagne': 'GB',
  'Suisse': 'CH',
  'Switzerland': 'CH',
  'Belgique': 'BE',
  'Belgium': 'BE',
  'Pays-Bas': 'NL',
  'Netherlands': 'NL',
  'Holland': 'NL',
  'Hollande': 'NL',
  'Suède': 'SE',
  'Sweden': 'SE',
  'Danemark': 'DK',
  'Denmark': 'DK',
  'Portugal': 'PT',
  'Norvège': 'NO',
  'Norway': 'NO',
  'Finlande': 'FI',
  'Finland': 'FI',
  'Autriche': 'AT',
  'Austria': 'AT',
  'Irlande': 'IE',
  'Ireland': 'IE',
  'Pologne': 'PL',
  'Poland': 'PL',
  'Grèce': 'GR',
  'Greece': 'GR',
  'République tchèque': 'CZ',
  'Czech Republic': 'CZ',
  'Tchéquie': 'CZ',
  'Hongrie': 'HU',
  'Hungary': 'HU',
  'Roumanie': 'RO',
  'Romania': 'RO',
  'Bulgarie': 'BG',
  'Bulgaria': 'BG',
  'Croatie': 'HR',
  'Croatia': 'HR',
  'Slovaquie': 'SK',
  'Slovakia': 'SK',
  'Slovénie': 'SI',
  'Slovenia': 'SI',
  'Luxembourg': 'LU',
  'Islande': 'IS',
  'Iceland': 'IS',
  'Estonie': 'EE',
  'Estonia': 'EE',
  'Lettonie': 'LV',
  'Latvia': 'LV',
  'Lituanie': 'LT',
  'Lithuania': 'LT',
  'Malte': 'MT',
  'Malta': 'MT',
  'Chypre': 'CY',
  'Cyprus': 'CY',
  'Serbie': 'RS',
  'Serbia': 'RS',
  
  // Americas
  'États-Unis': 'US',
  'United States': 'US',
  'USA': 'US',
  'Etats-Unis': 'US',
  'États Unis': 'US',
  'Canada': 'CA',
  'Mexique': 'MX',
  'Mexico': 'MX',
  'Brésil': 'BR',
  'Brazil': 'BR',
  'Argentine': 'AR',
  'Argentina': 'AR',
  'Chili': 'CL',
  'Chile': 'CL',
  'Colombie': 'CO',
  'Colombia': 'CO',
  'Pérou': 'PE',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Équateur': 'EC',
  'Ecuador': 'EC',
  'Uruguay': 'UY',
  'Paraguay': 'PY',
  'Bolivie': 'BO',
  'Bolivia': 'BO',
  'Costa Rica': 'CR',
  'Panama': 'PA',
  'Cuba': 'CU',
  
  // Asia
  'Chine': 'CN',
  'China': 'CN',
  'Japon': 'JP',
  'Japan': 'JP',
  'Inde': 'IN',
  'India': 'IN',
  'Corée du Sud': 'KR',
  'South Korea': 'KR',
  'Korea': 'KR',
  'Corée': 'KR',
  'Thaïlande': 'TH',
  'Thailand': 'TH',
  'Viêt Nam': 'VN',
  'Vietnam': 'VN',
  'Singapour': 'SG',
  'Singapore': 'SG',
  'Malaisie': 'MY',
  'Malaysia': 'MY',
  'Indonésie': 'ID',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Taïwan': 'TW',
  'Taiwan': 'TW',
  'Hong Kong': 'HK',
  'Turquie': 'TR',
  'Turkey': 'TR',
  'Émirats arabes unis': 'AE',
  'United Arab Emirates': 'AE',
  'UAE': 'AE',
  'Arabie saoudite': 'SA',
  'Saudi Arabia': 'SA',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Kazakhstan': 'KZ',
  
  // Oceania
  'Australie': 'AU',
  'Australia': 'AU',
  'Nouvelle-Zélande': 'NZ',
  'New Zealand': 'NZ',
  
  // Africa
  'Afrique du Sud': 'ZA',
  'South Africa': 'ZA',
  'Égypte': 'EG',
  'Egypt': 'EG',
  'Maroc': 'MA',
  'Morocco': 'MA',
  'Tunisie': 'TN',
  'Tunisia': 'TN',
  'Algérie': 'DZ',
  'Algeria': 'DZ',
  'Kenya': 'KE',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'Sénégal': 'SN',
  'Senegal': 'SN',
  'Côte d\'Ivoire': 'CI',
  'Ivory Coast': 'CI',
  'Éthiopie': 'ET',
  'Ethiopia': 'ET',
  
  // Eastern Europe & Russia
  'Russie': 'RU',
  'Russia': 'RU',
  'Ukraine': 'UA',
  'Biélorussie': 'BY',
  'Belarus': 'BY',
  
  // Others
  'Monaco': 'MC',
  'Liechtenstein': 'LI',
  'Andorre': 'AD',
  'Andorra': 'AD',
  'Vatican': 'VA',
  'Saint-Marin': 'SM',
  'San Marino': 'SM',
};

// Alternative mapping for common English country names to match CSV imports
const englishToFrench = {
  'united states': 'États-Unis',
  'usa': 'États-Unis',
  'united kingdom': 'Royaume-Uni',
  'uk': 'Royaume-Uni',
  'germany': 'Allemagne',
  'spain': 'Espagne',
  'italy': 'Italie',
  'switzerland': 'Suisse',
  'belgium': 'Belgique',
  'netherlands': 'Pays-Bas',
  'sweden': 'Suède',
  'denmark': 'Danemark',
  'brazil': 'Brésil',
  'china': 'Chine',
  'japan': 'Japon',
  'south korea': 'Corée du Sud',
  'australia': 'Australie',
  'new zealand': 'Nouvelle-Zélande',
};

// Returns the ISO code for a country name (case-insensitive, with fallback)
export function getCountryCode(name) {
  if (!name) return null;
  
  const normalized = name.trim().toLowerCase();
  
  // Direct match in countryNameToCode
  for (const [key, code] of Object.entries(countryNameToCode)) {
    if (key.toLowerCase() === normalized) {
      return code;
    }
  }
  
  // Try finding in English-to-French mapping
  const frenchName = englishToFrench[normalized];
  if (frenchName) {
    return countryNameToCode[frenchName];
  }
  
  // Fallback: try partial matching (contains)
  for (const [key, code] of Object.entries(countryNameToCode)) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return code;
    }
  }
  
  // If still not found, return null (will be handled by the component)
  return null;
}

// Get country code with fallback to name display
export function getCountryCodeOrName(name) {
  const code = getCountryCode(name);
  return code || null;
}
