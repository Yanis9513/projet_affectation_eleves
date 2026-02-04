/**
 * Composant Avatar reutilisable
 */
import { getInitials, getAvatarColor } from '../utils/constants';

export default function Avatar({ 
  name, 
  src, 
  size = 'md',
  className = '',
  showStatus = false,
  isOnline = false,
}) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  if (src) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
        {showStatus && (
          <span 
            className={`
              absolute bottom-0 right-0 block rounded-full ring-2 ring-white
              ${statusSizes[size]}
              ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}
            `}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizes[size]} ${bgColor}
          rounded-full flex items-center justify-center
          text-white font-medium ring-2 ring-white
        `}
      >
        {initials}
      </div>
      {showStatus && (
        <span 
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${statusSizes[size]}
            ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}
          `}
        />
      )}
    </div>
  );
}

// Groupe d'avatars empiles
export function AvatarGroup({ 
  users = [], 
  max = 4, 
  size = 'md',
  className = '' 
}) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;

  const overlapSizes = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
    xl: '-ml-4',
    '2xl': '-ml-5',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {displayed.map((user, index) => (
        <div 
          key={user.id || index}
          className={index > 0 ? overlapSizes[size] : ''}
        >
          <Avatar
            name={user.name}
            src={user.avatar}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className={overlapSizes[size]}>
          <div
            className={`
              ${size === 'xs' ? 'w-6 h-6 text-xs' : ''}
              ${size === 'sm' ? 'w-8 h-8 text-xs' : ''}
              ${size === 'md' ? 'w-10 h-10 text-sm' : ''}
              ${size === 'lg' ? 'w-12 h-12 text-base' : ''}
              bg-slate-200 text-slate-600
              rounded-full flex items-center justify-center
              font-medium ring-2 ring-white
            `}
          >
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}
