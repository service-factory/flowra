import React from 'react';

interface LogoTypeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'white' | 'dark' | 'mono';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const LogoType: React.FC<LogoTypeProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
  weight = 'semibold'
}) => {
  const sizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const getTextColor = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-slate-800';
      case 'mono':
        return 'text-current';
      default:
        return 'text-flow-primary';
    }
  };

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${weightClasses[weight]}
        ${getTextColor()}
        tracking-tight
        select-none
        ${className}
      `}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      Flowra
    </span>
  );
};

export default LogoType;