/**
 * Composant Alert ameliore
 */
import { useState, useEffect } from 'react';

export default function AlertBox({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  action,
  actionLabel,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(true);

  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      text: 'text-blue-700',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: 'text-emerald-600',
      title: 'text-emerald-800',
      text: 'text-emerald-700',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-800',
      text: 'text-amber-700',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-700',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  };

  const config = configs[type];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`
        relative rounded-xl border p-4
        ${config.bg}
        ${className}
      `}
      role="alert"
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          {icon || (
            <svg className={`w-5 h-5 ${config.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.iconPath} />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${config.title}`}>
              {title}
            </h3>
          )}
          {children && (
            <div className={`text-sm ${config.text} ${title ? 'mt-1' : ''}`}>
              {children}
            </div>
          )}
          {action && (
            <div className="mt-3">
              <button
                onClick={action}
                className={`text-sm font-medium ${config.title} hover:underline`}
              >
                {actionLabel || 'En savoir plus'}
              </button>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Alert avec timer auto-dismiss
export function TimedAlert({
  duration = 5000,
  onExpire,
  ...props
}) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        setIsVisible(false);
        onExpire?.();
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onExpire]);

  if (!isVisible) return null;

  return (
    <div className="relative">
      <AlertBox {...props} />
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-current opacity-30 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Banner pleine largeur
export function Banner({
  type = 'info',
  children,
  action,
  actionLabel,
  dismissible = true,
  onDismiss,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(true);

  const configs = {
    info: 'bg-blue-600 text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-red-600 text-white',
    neutral: 'bg-slate-800 text-white',
  };

  if (!isVisible) return null;

  return (
    <div className={`${configs[type]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium flex-1">
            {children}
          </p>
          <div className="flex items-center gap-3">
            {action && (
              <button
                onClick={action}
                className="text-sm font-semibold px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {actionLabel || 'Action'}
              </button>
            )}
            {dismissible && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss?.();
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
