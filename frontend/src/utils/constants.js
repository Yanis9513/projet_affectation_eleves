/**
 * Constantes et utilitaires partages pour le frontend
 */

// Types de projets
export const PROJECT_TYPES = {
  GROUP_PROJECT: 'group_project',
  ENGLISH_LEVELING: 'english_leveling',
  EXCHANGE_PROGRAM: 'exchange_program',
};

// Traductions des types de projets
export const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPES.GROUP_PROJECT]: 'Projet de groupe',
  [PROJECT_TYPES.ENGLISH_LEVELING]: 'Niveau d\'anglais',
  [PROJECT_TYPES.EXCHANGE_PROGRAM]: 'Programme d\'echange',
};

// Couleurs des types de projets
export const PROJECT_TYPE_COLORS = {
  [PROJECT_TYPES.GROUP_PROJECT]: 'bg-blue-100 text-blue-700',
  [PROJECT_TYPES.ENGLISH_LEVELING]: 'bg-emerald-100 text-emerald-700',
  [PROJECT_TYPES.EXCHANGE_PROGRAM]: 'bg-purple-100 text-purple-700',
};

// Icones des types de projets
export const PROJECT_TYPE_ICONS = {
  [PROJECT_TYPES.GROUP_PROJECT]: '👥',
  [PROJECT_TYPES.ENGLISH_LEVELING]: '🌍',
  [PROJECT_TYPES.EXCHANGE_PROGRAM]: '✈️',
};

// Niveaux d'anglais
export const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const ENGLISH_LEVEL_COLORS = {
  A1: 'bg-red-100 text-red-700',
  A2: 'bg-orange-100 text-orange-700',
  B1: 'bg-yellow-100 text-yellow-700',
  B2: 'bg-emerald-100 text-emerald-700',
  C1: 'bg-blue-100 text-blue-700',
  C2: 'bg-purple-100 text-purple-700',
};

// Filieres
export const FILIERES = [
  { value: 'INFO', label: 'Informatique' },
  { value: 'ELEC', label: 'Electronique' },
  { value: 'MECA', label: 'Mecanique' },
  { value: 'CIVIL', label: 'Genie Civil' },
  { value: 'BIOTECH', label: 'Biotechnologie' },
  { value: 'ENERGIE', label: 'Energie' },
];

// Grades pour programme d'echange
export const EXCHANGE_GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

export const EXCHANGE_GRADE_COLORS = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  D: 'bg-orange-100 text-orange-700 border-orange-200',
  E: 'bg-red-100 text-red-700 border-red-200',
  F: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const EXCHANGE_GRADE_LABELS = {
  A: 'Excellent - Premier choix',
  B: 'Tres bien',
  C: 'Bien',
  D: 'Acceptable',
  E: 'Peu interesse',
  F: 'Ne souhaite pas',
};

// Roles utilisateurs
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// Statuts
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
};

// Utilitaires
export function translateProjectType(type) {
  return PROJECT_TYPE_LABELS[type] || type?.replace('_', ' ') || 'Inconnu';
}

export function getProjectTypeColor(type) {
  return PROJECT_TYPE_COLORS[type] || 'bg-slate-100 text-slate-700';
}

export function getProjectTypeIcon(type) {
  return PROJECT_TYPE_ICONS[type] || '📁';
}

export function getEnglishLevelColor(level) {
  return ENGLISH_LEVEL_COLORS[level] || 'bg-slate-100 text-slate-700';
}

export function getExchangeGradeColor(grade) {
  return EXCHANGE_GRADE_COLORS[grade] || 'bg-slate-100 text-slate-700';
}

// Formatage de dates
export function formatDate(date, options = {}) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return formatDate(date);
  if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'A l\'instant';
}

// Validation email
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Tronquer texte
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generer initiales
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Couleurs aleatoires pour avatars
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// Drapeaux des pays
export const COUNTRY_FLAGS = {
  'France': '🇫🇷',
  'Allemagne': '🇩🇪',
  'Espagne': '🇪🇸',
  'Italie': '🇮🇹',
  'Royaume-Uni': '🇬🇧',
  'UK': '🇬🇧',
  'USA': '🇺🇸',
  'Etats-Unis': '🇺🇸',
  'Canada': '🇨🇦',
  'Japon': '🇯🇵',
  'Chine': '🇨🇳',
  'Coree du Sud': '🇰🇷',
  'Australie': '🇦🇺',
  'Bresil': '🇧🇷',
  'Suisse': '🇨🇭',
  'Belgique': '🇧🇪',
  'Pays-Bas': '🇳🇱',
  'Portugal': '🇵🇹',
  'Suede': '🇸🇪',
  'Norvege': '🇳🇴',
  'Danemark': '🇩🇰',
  'Finlande': '🇫🇮',
  'Irlande': '🇮🇪',
  'Autriche': '🇦🇹',
  'Pologne': '🇵🇱',
};

export function getCountryFlag(country) {
  return COUNTRY_FLAGS[country] || '🌍';
}

// Classname helper (comme clsx simplifie)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
