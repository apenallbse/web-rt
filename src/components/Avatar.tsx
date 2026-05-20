import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'motion/react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  fallbackColor = 'bg-slate-200'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-5xl',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-[1.5rem] flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      
      {!src && (
        <div className={`w-full h-full flex items-center justify-center font-black text-white ${fallbackColor}`}>
          {name ? initial : <User size={size === 'sm' ? 14 : size === 'md' ? 18 : 24} />}
        </div>
      )}
    </div>
  );
};

export default Avatar;
