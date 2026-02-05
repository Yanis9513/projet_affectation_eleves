/**
 * Composant SearchInput ameliore
 */
import { useState, useRef, useEffect } from 'react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounceMs = 300,
  showClear = true,
  showShortcut = true,
  autoFocus = false,
  size = 'md',
  className = '',
  onSearch,
}) {
  const [internalValue, setInternalValue] = useState(value || '');
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const sizes = {
    sm: 'h-8 pl-8 pr-8 text-sm',
    md: 'h-10 pl-10 pr-10 text-sm',
    lg: 'h-12 pl-12 pr-12 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-2',
    md: 'w-5 h-5 left-3',
    lg: 'w-6 h-6 left-3.5',
  };

  // Debounce le onChange
  useEffect(() => {
    if (debounceMs > 0 && onChange) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onChange(internalValue);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalValue, debounceMs, onChange]);

  // Sync avec value prop
  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    if (!showShortcut) return;

    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        handleClear();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showShortcut]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    if (debounceMs === 0 && onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <svg
        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${iconSizes[size]}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full bg-white border border-slate-300 rounded-lg
          text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          transition-colors
          ${sizes[size]}
        `}
      />

      {/* Clear button ou shortcut */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {showClear && internalValue && (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {showShortcut && !internalValue && (
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
}

// Barre de recherche avec filtres
export function SearchBar({
  value,
  onChange,
  placeholder,
  filters,
  activeFilter,
  onFilterChange,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="flex-1">
        <SearchInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      
      {filters && filters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                whitespace-nowrap transition-colors
                ${activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              {filter.icon && <span className="w-4 h-4">{filter.icon}</span>}
              {filter.label}
              {filter.count !== undefined && (
                <span className={`
                  px-1.5 py-0.5 text-xs font-medium rounded-full
                  ${activeFilter === filter.value
                    ? 'bg-white/20'
                    : 'bg-slate-200'
                  }
                `}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
