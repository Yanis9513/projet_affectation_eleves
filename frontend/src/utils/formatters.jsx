import React from 'react';

/**
 * Color map for filières — assign a consistent badge color per program
 * Keys must match the stored filière names.
 */
export const FILIERE_COLOR_MAP = {
  'Tronc commun programme généraliste': 'bg-sky-100 text-sky-800',
  'Tronc commun programme renforcé': 'bg-sky-100 text-sky-800',
  'Informatique, algorithmes et développement': 'bg-blue-100 text-blue-800',
  'Cybersécurité': 'bg-rose-100 text-rose-800',
  'Datascience et intelligence artificielle': 'bg-emerald-100 text-emerald-800',
  'Artificial intelligence and cybersecurity': 'bg-emerald-100 text-emerald-800',
  'Systèmes embarqués': 'bg-purple-100 text-purple-800',
  'Systèmes électroniques intelligents': 'bg-purple-100 text-purple-800',
  'Génie industriel, performance et innovation': 'bg-amber-100 text-amber-800',
  'E-santé et biotechnologies': 'bg-pink-100 text-pink-800',
  'Énergie': 'bg-amber-100 text-amber-800',
  'IMAC - Image, Multimédia, Audiovisuel & Communication': 'bg-indigo-100 text-indigo-800',
  'Informatique et applications': 'bg-blue-100 text-blue-800',
  'Informatique, design, architecture et développement': 'bg-blue-100 text-blue-800',
  'Data et applications': 'bg-emerald-100 text-emerald-800',
  'Réseaux et sécurité': 'bg-rose-100 text-rose-800',
  'Électronique et Informatique': 'bg-purple-100 text-purple-800',
  'Génie mécanique': 'bg-lime-100 text-lime-800',
  'Maintenance et fiabilité des processus industriels': 'bg-lime-100 text-lime-800',
  'Énergies': 'bg-amber-100 text-amber-800',
  'Génie civil': 'bg-slate-100 text-slate-800'
};

/**
 * Render accepted filieres as colored badges for display.
 * Returns React nodes (badges) suitable for embedding in JSX.
 */
export function formatFilieres(filieres) {
  if (!filieres) return <span className="text-slate-500">Non spécifié</span>;

  const upper = filieres.toUpperCase().trim();
  if (upper === 'ALL' || upper === 'TOUTES' || upper === 'TOUS') {
    return (
      <span className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm">
        Toutes
      </span>
    );
  }

  const items = filieres.split(',').map(s => s.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((f) => {
        const cls = FILIERE_COLOR_MAP[f] || 'bg-slate-100 text-slate-800';
        return (
          <span key={f} className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${cls}`}>
            <span className="max-w-[360px] block truncate">{f}</span>
          </span>
        );
      })}
    </div>
  );
}

export default formatFilieres;
