import { useState, useMemo } from 'react'

/**
 * DataTable - Composant reutilisable pour afficher des donnees en tableau
 * 
 * @param {Array} data - Donnees a afficher
 * @param {Array} columns - Configuration des colonnes [{key, label, render, sortable, width}]
 * @param {boolean} loading - Affiche un skeleton si true
 * @param {string} emptyMessage - Message quand pas de donnees
 * @param {ReactNode} emptyIcon - Icone pour l'etat vide
 * @param {function} onRowClick - Callback au clic sur une ligne
 * @param {boolean} selectable - Active la selection de lignes
 * @param {Array} selectedIds - IDs des lignes selectionnees
 * @param {function} onSelectionChange - Callback de changement de selection
 * @param {boolean} searchable - Active la recherche
 * @param {string} searchPlaceholder - Placeholder du champ de recherche
 * @param {Array} searchFields - Champs sur lesquels rechercher
 */
export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'Aucune donnee',
  emptyIcon,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  searchFields = [],
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Filtrage par recherche
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data

    const query = searchQuery.toLowerCase()
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, searchFields])

  // Tri
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = () => {
    if (selectedIds.length === sortedData.length) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(sortedData.map(item => item.id))
    }
  }

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(i => i !== id))
    } else {
      onSelectionChange?.([...selectedIds, id])
    }
  }

  // Skeleton loading
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Etat vide
  if (sortedData.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-12 text-center ${className}`}>
        {emptyIcon && (
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            {emptyIcon}
          </div>
        )}
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Barre de recherche */}
      {searchable && (
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === sortedData.length && sortedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      <svg
                        className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
                  ${selectedIds.includes(row.id) ? 'bg-blue-50' : ''}
                  transition-colors
                `}
                onClick={() => !selectable && onRowClick?.(row)}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer avec compte */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
        {sortedData.length} element{sortedData.length > 1 ? 's' : ''}
        {searchQuery && ` (filtre sur ${data.length})`}
      </div>
    </div>
  )
}
