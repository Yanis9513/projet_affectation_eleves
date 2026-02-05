import React from 'react';

/**
 * Loading Spinner Component - Modern Professional Style
 */
export function Loading({ size = 'md', text = 'Chargement...', variant = 'default' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const variants = {
    default: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    subtle: 'border-slate-300 border-t-slate-600',
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className={`${sizes[size]} border-[3px] ${variants[variant]} rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-sm text-slate-600 font-medium">{text}</p>}
    </div>
  );
}

/**
 * Page Loading Overlay - Modern Glass Effect
 */
export function LoadingOverlay({ text = 'Chargement...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Skeleton Loading Component
 */
export function Skeleton({ width = 'w-full', height = 'h-4', rounded = 'rounded', className = '' }) {
  return (
    <div className={`${width} ${height} ${rounded} bg-slate-200 animate-pulse ${className}`}></div>
  );
}

/**
 * Skeleton Card Component
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <Skeleton width="w-3/4" height="h-5" className="mb-4" />
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? 'w-1/2' : 'w-full'} 
          height="h-3" 
          className={i < lines - 1 ? 'mb-2' : ''} 
        />
      ))}
    </div>
  );
}

/**
 * Alert/Notification Component - Modern Professional Style
 */
export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  icon,
}) {
  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: 'text-emerald-500 bg-emerald-100',
      title: 'text-emerald-800',
      message: 'text-emerald-700',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-500 bg-red-100',
      title: 'text-red-800',
      message: 'text-red-700',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-500 bg-amber-100',
      title: 'text-amber-800',
      message: 'text-amber-700',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500 bg-blue-100',
      title: 'text-blue-800',
      message: 'text-blue-700',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
  };
  
  const style = styles[type];
  
  return (
    <div className={`${style.bg} border rounded-xl p-4 ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 p-1.5 rounded-lg ${style.icon}`}>
          {icon || (
            <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d={style.iconPath}></path>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {title && <h3 className={`text-sm font-semibold ${style.title}`}>{title}</h3>}
          {message && <p className={`text-sm ${style.message} ${title ? 'mt-1' : ''}`}>{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Toast notification (appears at top of screen)
 */
export function Toast({ type = 'info', message, duration = 3000, onClose }) {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <Alert type={type} message={message} onClose={onClose} />
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      )}
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>}
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
