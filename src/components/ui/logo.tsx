import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'gradient';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: '#ffffff',
          secondary: '#f1f5f9',
          accent: '#e2e8f0'
        };
      case 'gradient':
        return {
          primary: 'url(#gradient)',
          secondary: 'url(#gradient2)',
          accent: 'url(#gradient3)'
        };
      default:
        return {
          primary: '#2563eb',
          secondary: '#3b82f6',
          accent: '#1d4ed8'
        };
    }
  };

  const colors = getColors();

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        
        {/* Glow Effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle with subtle glow */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={variant === 'white' ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.05)'}
        stroke={variant === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(37,99,235,0.1)'}
        strokeWidth="1"
      />

      {/* Main Flow Symbol - Representing "Flow" */}
      <path
        d="M16 32 Q24 20, 32 32 Q40 44, 48 32"
        stroke={colors.primary}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      
      {/* Secondary Flow Lines */}
      <path
        d="M18 28 Q26 18, 34 28 Q42 38, 50 28"
        stroke={colors.secondary}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      <path
        d="M14 36 Q22 46, 30 36 Q38 26, 46 36"
        stroke={colors.secondary}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Aura/Harmony Circles - Representing "Aura" */}
      <circle
        cx="32"
        cy="32"
        r="8"
        fill={colors.primary}
        opacity="0.8"
        filter="url(#glow)"
      />
      
      <circle
        cx="32"
        cy="32"
        r="5"
        fill={variant === 'white' ? '#ffffff' : '#ffffff'}
        opacity="0.9"
      />

      {/* Connection Dots - Team Members */}
      <circle
        cx="20"
        cy="20"
        r="2"
        fill={colors.accent}
        opacity="0.8"
      />
      <circle
        cx="44"
        cy="20"
        r="2"
        fill={colors.accent}
        opacity="0.8"
      />
      <circle
        cx="20"
        cy="44"
        r="2"
        fill={colors.accent}
        opacity="0.8"
      />
      <circle
        cx="44"
        cy="44"
        r="2"
        fill={colors.accent}
        opacity="0.8"
      />

      {/* Connection Lines to Center */}
      <line
        x1="20"
        y1="20"
        x2="28"
        y2="28"
        stroke={colors.accent}
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="44"
        y1="20"
        x2="36"
        y2="28"
        stroke={colors.accent}
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="20"
        y1="44"
        x2="28"
        y2="36"
        stroke={colors.accent}
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="44"
        y1="44"
        x2="36"
        y2="36"
        stroke={colors.accent}
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Sparkle Effects */}
      <g opacity="0.6">
        <path
          d="M12 12 L14 14 L12 16 L10 14 Z"
          fill={colors.primary}
          transform="rotate(45 12 14)"
        />
        <path
          d="M52 12 L54 14 L52 16 L50 14 Z"
          fill={colors.primary}
          transform="rotate(45 52 14)"
        />
        <path
          d="M12 52 L14 54 L12 56 L10 54 Z"
          fill={colors.primary}
          transform="rotate(45 12 54)"
        />
        <path
          d="M52 52 L54 54 L52 56 L50 54 Z"
          fill={colors.primary}
          transform="rotate(45 52 54)"
        />
      </g>
    </svg>
  );
};

export default Logo;
