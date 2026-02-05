import React, { useState, useMemo, useRef, useEffect } from 'react';
import CountryFlag from 'react-country-flag';
import { countryNameToCode, getCountryCode } from '../utils/countryFlags';

const countries = Object.keys(countryNameToCode)
  .filter((name, index, self) => {
    // Remove duplicates (keep first occurrence)
    return self.findIndex(n => countryNameToCode[n] === countryNameToCode[name]) === index;
  })
  .sort();

export default function CountrySelect({ value, onChange, name = 'country', label = 'Pays', required = true }) {
  const [search, setSearch] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const filtered = useMemo(() =>
    countries.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  // Synchroniser search avec value quand value change
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  // Fermer la liste quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelect = (country) => {
    setShowDropdown(false);
    setSearch(country);
    if (onChange) {
      // Simulate event for compatibility
      onChange({ target: { name, value: country } });
    }
  };

  // Vérifier si la valeur actuelle est un pays valide
  // Utilise getCountryCode pour gérer les variantes et fallback
  const selectedCountryCode = search ? getCountryCode(search) : null;

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {selectedCountryCode && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <CountryFlag 
              countryCode={selectedCountryCode} 
              svg 
              style={{ 
                width: '1.5em', 
                height: '1.1em',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '2px',
                display: 'block',
                objectFit: 'cover'
              }} 
            />
          </div>
        )}
        <input
          type="text"
          name={name}
          autoComplete="off"
          required={required}
          ref={inputRef}
          value={search}
          placeholder="Rechercher un pays..."
          className={`w-full ${selectedCountryCode ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded`}
          onFocus={() => setShowDropdown(true)}
          onChange={e => {
            setSearch(e.target.value);
            setShowDropdown(true);
            if (onChange) {
              onChange({ target: { name, value: e.target.value } });
            }
          }}
        />
      </div>
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-48 overflow-y-auto shadow-lg mt-1">
          {filtered.map(country => (
            <li
              key={country}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50"
              onMouseDown={() => handleSelect(country)}
            >
              <CountryFlag 
                countryCode={countryNameToCode[country]} 
                svg 
                style={{ 
                  width: '1.5em', 
                  height: '1.1em',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '2px',
                  display: 'block',
                  objectFit: 'cover'
                }} 
              />
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
