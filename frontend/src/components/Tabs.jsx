/**
 * Composant Tabs/Onglets reutilisable
 */
import { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export default function Tabs({
  defaultValue,
  value,
  onChange,
  children,
  className = '',
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Liste des onglets
export function TabsList({ children, className = '' }) {
  return (
    <div 
      className={`flex items-center gap-1 p-1 bg-slate-100 rounded-lg ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

// Onglet individuel
export function Tab({ 
  value, 
  children, 
  icon,
  disabled = false,
  className = '' 
}) {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context.onChange(value)}
      className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
        transition-all duration-200
        ${isActive 
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

// Contenu des onglets
export function TabsContent({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  
  if (context.value !== value) return null;

  return (
    <div 
      role="tabpanel"
      className={`mt-4 ${className}`}
    >
      {children}
    </div>
  );
}

// Version underline
export function TabsUnderline({ 
  tabs, 
  value, 
  onChange,
  className = '' 
}) {
  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <nav className="flex gap-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            disabled={tab.disabled}
            className={`
              relative py-3 text-sm font-medium transition-colors
              ${tab.value === value
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${tab.value === value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </span>
            {tab.value === value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// Version pilules
export function TabsPills({ 
  tabs, 
  value, 
  onChange,
  size = 'md',
  className = '' 
}) {
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          disabled={tab.disabled}
          className={`
            inline-flex items-center gap-2 rounded-full font-medium transition-all
            ${sizes[size]}
            ${tab.value === value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={`
              px-1.5 py-0.5 text-xs font-medium rounded-full
              ${tab.value === value
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-600'
              }
            `}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
