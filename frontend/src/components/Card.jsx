import React from 'react';

/**
 * Reusable Card Component with ESIEE styling
 * Perfect for displaying projects, students, teachers, or any content
 * 
 * @param {ReactNode} children - Card content
 * @param {string} title - Optional card title
 * @param {ReactNode} header - Custom header content (overrides title)
 * @param {ReactNode} footer - Footer content (actions, buttons, etc.)
 * @param {boolean} hover - Add hover effect
 * @param {function} onClick - Make card clickable
 * @param {string} className - Additional classes
 */
export default function Card({
  children,
  title,
  header,
  footer,
  hover = false,
  onClick,
  className = '',
  ...props
}) {
  const isClickable = !!onClick;
  
  const baseStyles = 'bg-white rounded-xl shadow-lg overflow-hidden';
  const hoverStyles = (hover || isClickable) ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-2' : '';
  const clickableStyles = isClickable ? 'cursor-pointer' : '';
  
  const cardStyles = `${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`;
  
  return (
    <div className={cardStyles} onClick={onClick} {...props}>
      {/* Header Section */}
      {(header || title) && (
        <div className="px-6 py-4 bg-gradient-to-r from-esiee-blue to-blue-700 text-white">
          {header || <h3 className="text-lg font-bold">{title}</h3>}
        </div>
      )}
      
      {/* Body Section */}
      <div className="p-6">
        {children}
      </div>
      
      {/* Footer Section */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
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
  className = '',
  ...props
}) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border-l-4 border-esiee-blue p-6 transition-all duration-200 ${className}`} {...props}>
      {title && <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

/**
 * Card Grid Container - for displaying multiple cards
 */
export function CardGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
}
