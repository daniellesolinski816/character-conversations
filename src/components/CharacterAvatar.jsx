import React from 'react';
import { cn } from '@/lib/utils';

const colorPalette = [
  'from-violet-500 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
];

export default function CharacterAvatar({ name, avatar, size = 'md', onClick, isActive }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  const colorIndex = name ? name.charCodeAt(0) % colorPalette.length : 0;
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?';

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full flex items-center justify-center font-medium text-white transition-all duration-300",
        "ring-2 ring-transparent hover:ring-amber-400",
        isActive && "ring-amber-500 ring-offset-2",
        sizeClasses[size]
      )}
    >
      {avatar ? (
        <img 
          src={avatar} 
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className={cn(
          "w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br",
          colorPalette[colorIndex]
        )}>
          {initials}
        </div>
      )}
    </button>
  );
}