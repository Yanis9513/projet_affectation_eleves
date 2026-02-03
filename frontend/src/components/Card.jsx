export default function Card({
  children,
  title,
  subtitle,
  header,
  footer,
  hover = false,
  onClick,
  className = '',
  loading = false,
  variant = 'default', // default, elevated, outlined
  padding = 'normal', // compact, normal, spacious
  ...props
}) {
  const isClickable = !!onClick;
  
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border-2 border-slate-200',
  };
  
  const paddings = {
    compact: 'p-4',
    normal: 'p-5',
    spacious: 'p-6',
  };
  
  const baseStyles = `rounded-xl overflow-hidden ${variants[variant]}`;
  const hoverStyles = (hover || isClickable) 
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' 
    : 'transition-all duration-200';
  const clickableStyles = isClickable ? 'cursor-pointer' : '';
  const loadingStyles = loading ? 'animate-pulse' : '';
  
  const cardStyles = `${baseStyles} ${hoverStyles} ${clickableStyles} ${loadingStyles} ${className}`;
  
  return (
    <div className={cardStyles} onClick={onClick} {...props}>
      {/* Header Section */}
      {(header || title) && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          {header || (
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>
      )}
      
      {/* Body Section */}
      <div className={paddings[padding]}>
        {children}
      </div>
      
      {/* Footer Section */}
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Card with simple border style (alternative to gradient header)
 */
export function CardSimple({
  children,
  title,
  icon,
  loading = false,
  className = '',
  ...props
}) {
  const loadingStyles = loading ? 'animate-pulse' : '';
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition-all duration-200 ${loadingStyles} ${className}`} {...props}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {icon}
            </div>
          )}
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Stat Card - for displaying statistics
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color = 'blue', // blue, green, purple, orange, red
  className = '',
  ...props
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };
  
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition-all duration-300 hover:shadow-md ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <svg className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${iconColors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Card Grid Container - for displaying multiple cards
 */
export function CardGrid({ children, cols = 3, className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${colClasses[cols] || colClasses[3]} gap-5 ${className}`}>
      {children}
    </div>
  );
}
