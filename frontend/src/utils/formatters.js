/**
 * Utility functions for formatting display data
 */

/**
 * Format accepted filieres for display
 * @param {string} filieres - The filieres string (e.g., "ALL", "INFORMATIQUE,ELECTRONIQUE")
 * @returns {string} - Formatted string
 */
export function formatFilieres(filieres) {
  if (!filieres) return 'Non spécifié';
  
  const upper = filieres.toUpperCase().trim();
  
  if (upper === 'ALL' || upper === 'TOUTES' || upper === 'TOUS') {
    return 'Toutes';
  }
  
  return filieres;
}

/**
 * Get display text for country with fallback
 * @param {string} country - Country name
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Formatted country name
 */
export function formatCountryName(country, maxLength = 20) {
  if (!country) return '';
  
  if (country.length <= maxLength) {
    return country;
  }
  
  // Truncate with ellipsis
  return country.substring(0, maxLength - 1) + '…';
}
