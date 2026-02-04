/**
 * Composant Badge/Tag reutilisable
 */

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  icon,
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    // Versions solides
    'primary-solid': 'bg-blue-600 text-white border-blue-600',
    'success-solid': 'bg-emerald-600 text-white border-emerald-600',
    'warning-solid': 'bg-amber-500 text-white border-amber-500',
    'danger-solid': 'bg-red-600 text-white border-red-600',
    // Versions outline
    'primary-outline': 'bg-transparent text-blue-600 border-blue-600',
    'success-outline': 'bg-transparent text-emerald-600 border-emerald-600',
    'danger-outline': 'bg-transparent text-red-600 border-red-600',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    default: 'bg-slate-500',
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    purple: 'bg-purple-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant.split('-')[0]] || dotColors.default}`} />
      )}
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}

// Badge de comptage
export function CountBadge({ count, max = 99, variant = 'danger', className = '' }) {
  const displayCount = count > max ? `${max}+` : count;
  
  const variants = {
    default: 'bg-slate-600',
    primary: 'bg-blue-600',
    danger: 'bg-red-600',
    success: 'bg-emerald-600',
  };

  if (count <= 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5
        text-xs font-bold text-white rounded-full
        ${variants[variant]}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}

// Badge de statut avec icone
export function StatusBadge({ status, size = 'md' }) {
  const configs = {
    online: { label: 'En ligne', color: 'success', dot: true },
    offline: { label: 'Hors ligne', color: 'default', dot: true },
    active: { label: 'Actif', color: 'success', dot: true },
    inactive: { label: 'Inactif', color: 'default', dot: true },
    pending: { label: 'En attente', color: 'warning', dot: true },
    completed: { label: 'Termine', color: 'primary', dot: false },
    error: { label: 'Erreur', color: 'danger', dot: true },
    draft: { label: 'Brouillon', color: 'default', dot: false },
    published: { label: 'Publie', color: 'success', dot: false },
    archived: { label: 'Archive', color: 'default', dot: false },
  };

  const config = configs[status] || { label: status, color: 'default', dot: false };

  return (
    <Badge variant={config.color} size={size} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

// Groupe de badges
export function BadgeGroup({ badges, max = 3, size = 'md', className = '' }) {
  const displayed = badges.slice(0, max);
  const remaining = badges.length - max;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayed.map((badge, i) => (
        <Badge key={i} variant={badge.variant || 'default'} size={size}>
          {badge.label || badge}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="default" size={size}>
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
