import React from 'react';
import CountryFlag from 'react-country-flag';

/**
 * CountryFlag wrapper with border for better visibility
 * Useful for flags with white backgrounds (e.g., Japan)
 */
export default function CountryFlagBordered({ countryCode, ...props }) {
  if (!countryCode) return null;
  
  return (
    <span className="inline-block country-flag-bordered">
      <CountryFlag 
        countryCode={countryCode} 
        svg 
        style={{ width: '1.5em', height: '1.1em', display: 'block' }}
        {...props}
      />
    </span>
  );
}
