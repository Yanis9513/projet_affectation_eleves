import { forwardRef } from 'react';

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    className = '',
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  // Size configurations
  const sizeConfig = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base',
  };

  // Professional variant configurations
  const variantConfig = {
    // Primary: Main action buttons
    primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      active:bg-blue-800
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      shadow-sm hover:shadow-md
      border border-transparent
    `,
    
    // Secondary: Alternative actions
    secondary: `
      bg-white text-gray-700
      hover:bg-gray-50
      active:bg-gray-100
      focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
      shadow-sm hover:shadow-md
      border border-gray-300
    `,
    
    // Outline: Less prominent actions
    outline: `
      bg-transparent text-blue-600
      hover:bg-blue-50
      active:bg-blue-100
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      border-2 border-blue-600
    `,
    
    // Ghost: Subtle actions
    ghost: `
      bg-transparent text-gray-600
      hover:bg-gray-100
      active:bg-gray-200
      focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
      border border-transparent
    `,
    
    // Success: Positive actions
    success: `
      bg-green-600 text-white
      hover:bg-green-700
      active:bg-green-800
      focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      shadow-sm hover:shadow-md
      border border-transparent
    `,
    
    // Warning: Caution actions
    warning: `
      bg-orange-600 text-white
      hover:bg-orange-700
      active:bg-orange-800
      focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
      shadow-sm hover:shadow-md
      border border-transparent
    `,
    
    // Danger: Destructive actions
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      active:bg-red-800
      focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      shadow-sm hover:shadow-md
      border border-transparent
    `,
    
    // Link: Text-only button
    link: `
      bg-transparent text-blue-600
      hover:text-blue-700
      active:text-blue-800
      underline-offset-4 hover:underline
      border border-transparent
      shadow-none
    `,
  };

  // Base styles applied to all buttons
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium
    rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
  `;

  // Loading spinner
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const buttonClasses = `
    ${baseStyles}
    ${variantConfig[variant]}
    ${sizeConfig[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <span className="mr-2 -ml-1">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="ml-2 -mr-1">{rightIcon}</span>
      )}
    </button>
  );
});

export default Button;
