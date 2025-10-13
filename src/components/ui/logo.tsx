import React, { useId, useMemo } from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'white' | 'dark' | 'mono';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
  animated = false
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24'
  };

  const palette = useMemo(() => {
    switch (variant) {
      case 'white':
        return {
          primary: '#ffffff',
          secondary: 'rgba(255,255,255,0.85)',
          accent: 'rgba(255,255,255,0.92)',
          surface: 'rgba(255,255,255,0.18)'
        };
      case 'dark':
        return {
          primary: '#0f172a',
          secondary: '#1e293b',
          accent: '#475569',
          surface: 'rgba(15,23,42,0.35)'
        };
      case 'mono':
        return {
          primary: 'currentColor',
          secondary: 'currentColor',
          accent: 'currentColor',
          surface: 'transparent'
        };
      default:
        return {
          primary: '#2563eb',
          secondary: '#38bdf8',
          accent: '#f59e0b',
          surface: 'rgba(37,99,235,0.14)'
        };
    }
  }, [variant]);

  const baseId = useId();
  const flowGradientId = `${baseId}-flow`;
  const auraGradientId = `${baseId}-aura`;

  return (
    <svg
      className={`${sizeClasses[size]} ${className} ${animated ? 'animate-pulse hover:scale-110 transition-all duration-300' : ''}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={flowGradientId} x1="18" y1="26" x2="48" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.primary} />
          <stop offset="100%" stopColor={palette.secondary} />
        </linearGradient>
        <linearGradient id={auraGradientId} x1="16" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.secondary} />
          <stop offset="100%" stopColor={palette.accent} />
        </linearGradient>
      </defs>

      <g>
        {palette.surface !== 'transparent' && <circle cx="32" cy="32" r="24" fill={palette.surface} />}

        {/* Aura ring that wraps the team */}
        <g transform="rotate(-18 32 32)">
          <circle
            cx="32"
            cy="32"
            r="20"
            stroke={`url(#${auraGradientId})`}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="94 36"
          >
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 32 32"
                to="360 32 32"
                dur="7s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

        {/* Flow line showing a guided hand-off */}
        <path
          d="M20 38 C24 26 40 26 44 32"
          stroke={`url(#${flowGradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="32" cy="32" r="9" fill={palette.primary} />
        <circle
          cx="44"
          cy="24"
          r="4"
          fill={palette.accent}
          opacity={variant === 'mono' ? 0.6 : 1}
        />
      </g>
    </svg>
  );
};

export default Logo;
