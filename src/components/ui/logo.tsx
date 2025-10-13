import React from 'react';

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

  // Generate unique IDs for gradients to avoid conflicts
  const gradientId1 = `flowra-gradient-1-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId2 = `flowra-gradient-2-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId3 = `flowra-gradient-3-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId4 = `flowra-gradient-4-${Math.random().toString(36).substr(2, 9)}`;
  const shadowId = `flowra-shadow-${Math.random().toString(36).substr(2, 9)}`;

  const getColorScheme = () => {
    switch (variant) {
      case 'white':
        return {
          flow1: '#ffffff',
          flow2: 'rgba(255,255,255,0.9)',
          aura1: 'rgba(255,255,255,0.8)',
          aura2: 'rgba(255,255,255,0.6)',
          shadow: 'rgba(0,0,0,0.1)'
        };
      case 'dark':
        return {
          flow1: '#1e293b',
          flow2: '#334155',
          aura1: '#475569',
          aura2: '#64748b',
          shadow: 'rgba(0,0,0,0.3)'
        };
      case 'mono':
        return {
          flow1: 'currentColor',
          flow2: 'currentColor',
          aura1: 'currentColor',
          aura2: 'currentColor',
          shadow: 'currentColor'
        };
      default:
        return {
          // Flow gradients - Blue to Teal (like our design tokens)
          flow1: '#2563eb', // Deep blue
          flow2: '#0ea5e9', // Sky blue
          // Aura gradients - Warm accent colors
          aura1: '#f59e0b', // Amber
          aura2: '#f97316', // Orange
          shadow: 'rgba(37, 99, 235, 0.2)'
        };
    }
  };

  const colors = getColorScheme();

  return (
    <svg
      className={`${sizeClasses[size]} ${className} ${animated ? 'animate-pulse hover:scale-110 transition-all duration-300' : ''}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Flow Gradient 1 - Main Flow Element */}
        <linearGradient id={gradientId1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.flow1} />
          <stop offset="100%" stopColor={colors.flow2} />
        </linearGradient>

        {/* Flow Gradient 2 - Secondary Flow */}
        <linearGradient id={gradientId2} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={colors.flow2} />
          <stop offset="100%" stopColor={colors.flow1} />
        </linearGradient>

        {/* Aura Gradient 1 - Warm Accent */}
        <radialGradient id={gradientId3} cx="50%" cy="30%">
          <stop offset="0%" stopColor={colors.aura1} />
          <stop offset="100%" stopColor={colors.aura2} />
        </radialGradient>

        {/* Aura Gradient 2 - Harmony Element */}
        <linearGradient id={gradientId4} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors.aura2} />
          <stop offset="50%" stopColor={colors.aura1} />
          <stop offset="100%" stopColor={colors.aura2} />
        </linearGradient>

        {/* 3D Shadow Effect */}
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor={colors.shadow} floodOpacity="0.3"/>
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
        </filter>

        {/* Glow Effect for Animation */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Professional Flowra Logo Design */}
      <g>
        {/* Main Flow Shape - Like Toss 3D but for Flow concept */}
        <path
          d="M12 20 C12 14, 16 10, 22 10 L32 10 Q42 10, 45 20 Q48 25, 45 30 L45 35 Q45 45, 35 48 Q25 50, 20 45 L15 40 Q12 35, 12 30 Z"
          fill={`url(#${gradientId1})`}
          filter={`url(#${shadowId})`}
        />

        {/* Secondary Flow Element - Overlapping for depth */}
        <path
          d="M25 8 C35 8, 42 12, 48 20 Q52 26, 50 32 Q48 38, 42 42 Q36 46, 30 44 Q24 42, 22 36 Q20 30, 25 25 L25 20 Q25 12, 25 8 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.85"
          filter={`url(#${shadowId})`}
        />

        {/* Aura Harmony Circle - Center focal point */}
        <circle
          cx="32"
          cy="28"
          r="8"
          fill={`url(#${gradientId3})`}
          filter={`url(#${shadowId})`}
        />

        {/* Inner Harmony Ring */}
        <circle
          cx="32"
          cy="28"
          r="5"
          fill={`url(#${gradientId4})`}
          opacity="0.9"
        />

        {/* Flow Direction Indicators - Minimalist but meaningful */}
        <path
          d="M20 18 Q28 14, 36 18 Q44 22, 52 18"
          stroke={`url(#${gradientId3})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />

        <path
          d="M18 35 Q26 39, 34 35 Q42 31, 50 35"
          stroke={`url(#${gradientId4})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Team Connection Points - Subtle but present */}
        <circle cx="16" cy="16" r="2" fill={`url(#${gradientId3})`} opacity="0.8" />
        <circle cx="48" cy="16" r="2" fill={`url(#${gradientId4})`} opacity="0.8" />
        <circle cx="16" cy="40" r="2" fill={`url(#${gradientId4})`} opacity="0.8" />
        <circle cx="48" cy="40" r="2" fill={`url(#${gradientId3})`} opacity="0.8" />

        {/* Highlight for 3D Effect */}
        <ellipse
          cx="28"
          cy="18"
          rx="6"
          ry="10"
          fill="rgba(255,255,255,0.2)"
          transform="rotate(-15 28 18)"
          opacity="0.6"
        />

        {/* Animated Glow for Interactive State */}
        {animated && (
          <g filter="url(#glow)">
            <circle cx="32" cy="28" r="12" fill="none" stroke={colors.flow1} strokeWidth="0.5" opacity="0.3">
              <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
        )}
      </g>
    </svg>
  );
};

export default Logo;
