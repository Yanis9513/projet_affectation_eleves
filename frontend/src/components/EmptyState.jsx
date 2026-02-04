/**
 * Composant EmptyState reutilisable
 * Pour afficher un etat vide avec illustration et action
 */

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  className = '',
}) {
  // Icones par defaut
  const defaultIcons = {
    projects: (
      <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    students: (
      <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    assignments: (
      <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    search: (
      <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    error: (
      <svg className="w-16 h-16 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-4">
        {typeof icon === 'string' ? defaultIcons[icon] : icon || defaultIcons.projects}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title || 'Aucun element'}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {action && (
          <button
            onClick={action}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {actionLabel || 'Commencer'}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction}
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            {secondaryActionLabel || 'En savoir plus'}
          </button>
        )}
      </div>
    </div>
  );
}

// Version compacte pour les listes
export function EmptyStateCompact({
  icon,
  message,
  action,
  actionLabel,
  className = '',
}) {
  return (
    <div className={`flex items-center justify-center py-8 px-4 ${className}`}>
      <div className="text-center">
        {icon && (
          <div className="mx-auto mb-2 text-slate-400">
            {icon}
          </div>
        )}
        <p className="text-sm text-slate-500 mb-3">
          {message || 'Aucun element trouve'}
        </p>
        {action && (
          <button
            onClick={action}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Etat d'erreur
export function ErrorState({
  title = 'Une erreur est survenue',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reessayer
        </button>
      )}
    </div>
  );
}
