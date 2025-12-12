import React from 'react';

/**
 * Loading Spinner Component
 */
export function Loading({ size = 'md', text = 'Chargement...' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} border-4 border-esiee-blue border-t-transparent rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
    </div>
  );
}

/**
 * Page Loading Overlay
 */
export function LoadingOverlay({ text = 'Chargement...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-2xl">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Alert/Notification Component
 */
export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) {
  const styles = {
    success: {
      bg: 'bg-green-50 border-green-500',
      icon: 'text-green-500',
      title: 'text-green-800',
      message: 'text-green-700',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    info: {
      bg: 'bg-blue-50 border-blue-500',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-700',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
  };
  
  const style = styles[type];
  
  return (
    <div className={`${style.bg} border-l-4 rounded-lg p-4 ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${style.icon}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d={style.iconPath}></path>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>}
          {message && <p className={`text-sm ${style.message} ${title ? 'mt-1' : ''}`}>{message}</p>}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${style.icon} hover:bg-opacity-20 focus:outline-none`}
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
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
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <Alert type={type} message={message} onClose={onClose} />
    </div>
  );
}
