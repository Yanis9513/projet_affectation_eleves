import React from 'react';

/**
 * Reusable Button Component with ESIEE styling
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} disabled - Disable button
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional classes
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  // Base styles for all buttons
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles with ESIEE colors
  const variants = {
    primary: 'bg-gradient-to-r from-esiee-blue to-blue-700 text-white hover:from-blue-700 hover:to-blue-900 focus:ring-esiee-blue shadow-md hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 hover:shadow-md',
    danger: 'bg-gradient-to-r from-esiee-red to-red-700 text-white hover:from-red-700 hover:to-red-900 focus:ring-esiee-red shadow-md hover:shadow-xl transform hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-900 focus:ring-green-500 shadow-md hover:shadow-xl transform hover:-translate-y-0.5',
    outline: 'border-2 border-esiee-blue text-esiee-blue hover:bg-esiee-blue hover:text-white focus:ring-esiee-blue hover:shadow-md transform hover:-translate-y-0.5',
  };
  
  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
