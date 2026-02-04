/**
 * StatusBadge - Composant pour afficher un badge de statut
 * 
 * @param {string} status - Statut a afficher
 * @param {string} variant - Variante de couleur (success, warning, error, info, neutral)
 * @param {string} size - Taille (sm, md, lg)
 * @param {boolean} dot - Affiche un point anime
 */
export default function StatusBadge({
  status,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
    purple: 'bg-purple-500'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${variantClasses[variant] || variantClasses.neutral}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
      )}
      {status}
    </span>
  )
}

// Presets pour les types de projets
export function ProjectTypeBadge({ type }) {
  const config = {
    'exchange_program': { label: 'Echange', variant: 'purple' },
    'english_leveling': { label: 'Niveau Anglais', variant: 'success' },
    'group_project': { label: 'Groupe', variant: 'info' }
  }

  const { label, variant } = config[type] || { label: type, variant: 'neutral' }
  return <StatusBadge status={label} variant={variant} />
}

// Presets pour les statuts actif/inactif
export function ActiveBadge({ isActive }) {
  return (
    <StatusBadge
      status={isActive ? 'Actif' : 'Inactif'}
      variant={isActive ? 'success' : 'neutral'}
      dot={isActive}
    />
  )
}

// Presets pour les preferences
export function PreferencesBadge({ isOpen }) {
  return (
    <StatusBadge
      status={isOpen ? 'Preferences ouvertes' : 'Preferences fermees'}
      variant={isOpen ? 'info' : 'neutral'}
      dot={isOpen}
    />
  )
}
