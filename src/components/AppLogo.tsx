import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-sky-500 shadow-md ${className}`} 
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
      >
        {/* Background */}
        <circle cx="50" cy="50" r="50" fill="#4B90CA" />
        
        {/* Colorful Abstract People - Person 1 (Top) */}
        <path d="M 50 15 A 8 8 0 1 1 50 31 A 8 8 0 1 1 50 15 Z" fill="#95C24D" />
        <path d="M 50 33 C 35 33 25 45 35 60 C 45 75 50 60 50 60 C 50 60 55 75 65 60 C 75 45 65 33 50 33 Z" fill="url(#grad1)" opacity="0.9" />

        {/* Person 2 (Bottom Right) */}
        <path d="M 75 35 A 8 8 0 1 1 75 51 A 8 8 0 1 1 75 35 Z" fill="#C9327A" />
        <path d="M 72 53 C 60 45 42 55 45 70 C 48 85 62 80 62 80 C 62 80 75 82 85 70 C 95 58 84 61 72 53 Z" fill="url(#grad2)" opacity="0.9" />

        {/* Person 3 (Bottom Left) */}
        <path d="M 25 35 A 8 8 0 1 1 25 51 A 8 8 0 1 1 25 35 Z" fill="#1CADD3" />
        <path d="M 28 53 C 40 45 58 55 55 70 C 52 85 38 80 38 80 C 38 80 25 82 15 70 C 5 58 16 61 28 53 Z" fill="url(#grad3)" opacity="0.9" />
        
        {/* Connecting arms illusion */}
        <path d="M 33 60 C 40 50 60 50 67 60" stroke="#EFCB4B" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <path d="M 45 70 C 50 85 62 80 62 80" stroke="#903F98" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <path d="M 55 70 C 50 85 38 80 38 80" stroke="#169C5C" strokeWidth="6" strokeLinecap="round" opacity="0.8" />

        <defs>
          <linearGradient id="grad1" x1="50" y1="33" x2="50" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFCB4B" />
            <stop offset="1" stopColor="#95C24D" />
          </linearGradient>
          <linearGradient id="grad2" x1="72" y1="53" x2="62" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9327A" />
            <stop offset="1" stopColor="#903F98" />
          </linearGradient>
          <linearGradient id="grad3" x1="28" y1="53" x2="38" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1CADD3" />
            <stop offset="1" stopColor="#169C5C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AppLogo;
