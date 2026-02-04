/**
 * Composant Dropdown/Select reutilisable
 */
import { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  trigger,
  children,
  align = 'left',
  width = 'auto',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  const widths = {
    auto: 'w-auto min-w-[200px]',
    full: 'w-full',
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64',
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 py-1 bg-white rounded-lg shadow-lg border border-slate-200
            ${alignments[align]} ${widths[width]}
          `}
        >
          {typeof children === 'function' 
            ? children({ close: () => setIsOpen(false) })
            : children
          }
        </div>
      )}
    </div>
  );
}

// Item du dropdown
export function DropdownItem({
  children,
  icon,
  onClick,
  disabled = false,
  danger = false,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2 text-sm text-left
        transition-colors
        ${disabled 
          ? 'text-slate-400 cursor-not-allowed'
          : danger
            ? 'text-red-600 hover:bg-red-50'
            : 'text-slate-700 hover:bg-slate-50'
        }
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// Separateur
export function DropdownDivider() {
  return <div className="my-1 border-t border-slate-200" />;
}

// Label de groupe
export function DropdownLabel({ children }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {children}
    </div>
  );
}

// Select avec options
export function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Selectionner...',
  disabled = false,
  error,
  label,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2 px-3 py-2
            bg-white border rounded-lg text-left text-sm
            transition-colors
            ${disabled 
              ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
              : error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
            }
          `}
        >
          <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                  transition-colors
                  ${option.value === value 
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                {option.label}
                {option.value === value && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
