export default function Card({
  children,
  title,
  header,
  footer,
  hover = false,
  onClick,
  className = '',
  loading = false,
  ...props
}) {
  const isClickable = !!onClick;
  
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden';
  const hoverStyles = (hover || isClickable) ? 'transition-shadow duration-200 hover:shadow-md hover:-translate-y-0.5' : '';
  const clickableStyles = isClickable ? 'cursor-pointer' : '';
  const loadingStyles = loading ? 'animate-pulse opacity-70' : '';
  
  const cardStyles = `${baseStyles} ${hoverStyles} ${clickableStyles} ${loadingStyles} ${className}`;
  
  return (
    <div className={cardStyles} onClick={onClick} {...props}>
      {/* Header Section */}
      {(header || title) && (
        <div className="px-5 py-4 border-b border-gray-200 bg-white">
          {header || <h3 className="text-base font-medium text-gray-900">{title}</h3>}
        </div>
      )}
      
      {/* Body Section */}
      <div className="p-5">
        {children}
      </div>
      
      {/* Footer Section */}
      {footer && (
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
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
  loading = false,
  className = '',
  ...props
}) {
  const loadingStyles = loading ? 'animate-pulse opacity-70' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 ${loadingStyles} ${className}`} {...props}>
      {title && <h3 className="text-base font-medium text-gray-900 mb-3">{title}</h3>}
      {children}
    </div>
  );
}

/**
 * Card Grid Container - for displaying multiple cards
 */
export function CardGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {children}
    </div>
  );
}
