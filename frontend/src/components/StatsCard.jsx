/**
 * StatsCard - Composant reutilisable pour afficher des statistiques
 * 
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur a afficher
 * @param {string} subtitle - Texte sous la valeur
 * @param {string} color - Couleur du theme (blue, emerald, purple, amber, red)
 * @param {ReactNode} icon - Icone SVG a afficher
 * @param {string} trend - Tendance (+5%, -3%, etc.)
 * @param {string} trendDirection - 'up' ou 'down'
 */
export default function StatsCard({
  title,
  value,
  subtitle,
  color = 'blue',
  icon,
  trend,
  trendDirection,
  className = ''
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100'
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-100'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              {title}
            </p>
          )}
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trendDirection === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trendDirection === 'up' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
              </svg>
            )}
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour un groupe de stats
export function StatsGrid({ children, columns = 4, className = '' }) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${colClasses[columns] || colClasses[4]} gap-4 ${className}`}>
      {children}
    </div>
  )
}
