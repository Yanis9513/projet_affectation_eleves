import { useState, useRef, useEffect } from 'react';
import { FILIERE_COLOR_MAP } from '../utils/formatters.jsx';

// Liste complète des filières ESIEE Paris
export const ESIEE_FILIERES = [
  'Tronc commun programme généraliste',
  'Tronc commun programme renforcé',
  'Informatique, algorithmes et développement',
  'Cybersécurité',
  'Datascience et intelligence artificielle',
  'Artificial intelligence and cybersecurity',
  'Systèmes embarqués',
  'Systèmes électroniques intelligents',
  'Génie industriel, performance et innovation',
  'E-santé et biotechnologies',
  'Énergie',
  'IMAC - Image, Multimédia, Audiovisuel & Communication',
  'Informatique et applications',
  'Informatique, design, architecture et développement',
  'Data et applications',
  'Réseaux et sécurité',
  'Électronique et Informatique',
  'Génie mécanique',
  'Maintenance et fiabilité des processus industriels',
  'Énergies',
  'Génie civil'
];

/**
 * Multi-select component for selecting filières (programs)
 */
export default function FiliereSelector({ value = '', onChange, name = 'accepted_filieres', required = false }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFilieres, setSelectedFilieres] = useState(() => {
    // Default: when no value provided, nothing is selected (TOUTES unchecked)
    if (!value) return [];
    // If explicit ALL/TOUTES passed from parent, select the sentinel
    if (value === 'ALL' || value === 'TOUS' || value === 'TOUTES') return ['TOUTES'];
    // Otherwise parse comma-separated list
    return value.split(',').map(f => f.trim()).filter(Boolean);
  });
  const containerRef = useRef(null);

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

  const handleToggleFiliere = (filiere) => {
    let newSelection;
    
    if (filiere === 'TOUTES') {
      // Si on sélectionne TOUTES, on désélectionne tout le reste
      newSelection = selectedFilieres.includes('TOUTES') ? [] : ['TOUTES'];
    } else {
      // Si on sélectionne une filière spécifique, on retire TOUTES
      if (selectedFilieres.includes(filiere)) {
        newSelection = selectedFilieres.filter(f => f !== filiere);
      } else {
        newSelection = [...selectedFilieres.filter(f => f !== 'TOUTES'), filiere];
      }
    }
    
    setSelectedFilieres(newSelection);
    
    // Notifier le parent
    if (onChange) {
      const valueToSend = newSelection.length === 0 ? 'ALL' : 
                         newSelection.includes('TOUTES') ? 'ALL' : 
                         newSelection.join(',');
      onChange({ target: { name, value: valueToSend } });
    }
  };

  // Use fixed mapping for badge colors so each filière has a consistent color
  const COLOR_MAP = FILIERE_COLOR_MAP;

  const getDisplayText = () => {
    if (selectedFilieres.length === 0 || selectedFilieres.includes('TOUTES')) {
      return 'Toutes les filières';
    }
    if (selectedFilieres.length === 1) {
      return selectedFilieres[0];
    }
    return `${selectedFilieres.length} filières sélectionnées`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Filières acceptées
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left bg-white hover:border-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between"
      >
        <span className={selectedFilieres.length === 0 ? 'text-slate-400' : 'text-slate-900'}>
          {getDisplayText()}
        </span>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Option TOUTES en premier */}
          <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-200">
            <input
              type="checkbox"
              checked={selectedFilieres.includes('TOUTES')}
              onChange={() => handleToggleFiliere('TOUTES')}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="font-semibold text-blue-700">Toutes les filières</span>
          </label>

          {/* Liste des filières */}
          {ESIEE_FILIERES.map((filiere) => (
            <label 
              key={filiere} 
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFilieres.includes(filiere)}
                onChange={() => handleToggleFiliere(filiere)}
                disabled={selectedFilieres.includes('TOUTES')}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className={`text-sm ${selectedFilieres.includes('TOUTES') ? 'text-slate-400' : 'text-slate-700'}`}>
                {filiere}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Display selected badges */}
      {!showDropdown && selectedFilieres.length > 0 && !selectedFilieres.includes('TOUTES') && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedFilieres.slice(0, 6).map((filiere) => {
            const colorClass = COLOR_MAP[filiere] || 'bg-slate-100 text-slate-800';
            return (
              <span
                key={filiere}
                className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${colorClass}`}
              >
                <span className="max-w-[220px] block truncate">{filiere}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFiliere(filiere);
                  }}
                  className="opacity-80 hover:opacity-100"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            );
          })}
          {selectedFilieres.length > 6 && (
            <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
              +{selectedFilieres.length - 6} autres
            </span>
          )}
        </div>
      )}
    </div>
  );
}
