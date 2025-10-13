import React from 'react';
import { Logo } from './logo';
import { LogoType } from './logo-type';

interface BrandProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'white' | 'dark' | 'mono';
  layout?: 'horizontal' | 'vertical' | 'logo-only' | 'text-only';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  onClick?: () => void;
}

export const Brand: React.FC<BrandProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
  layout = 'horizontal',
  weight = 'semibold',
  onClick
}) => {
  const spacing = {
    xs: 'gap-1.5',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-5',
    '2xl': 'gap-6',
    '3xl': 'gap-8'
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col items-center';
      case 'logo-only':
        return 'flex items-center';
      case 'text-only':
        return 'flex items-center';
      default: // horizontal
        return 'flex items-center';
    }
  };

  const interactiveClasses = onClick
    ? 'cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95'
    : '';

  return (
    <div
      className={`${getLayoutClasses()} ${spacing[size]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {layout !== 'text-only' && (
        <Logo
          size={size}
          variant={variant}
          className="flex-shrink-0"
        />
      )}

      {layout !== 'logo-only' && (
        <LogoType
          size={size}
          variant={variant}
          weight={weight}
          className="flex-shrink-0"
        />
      )}
    </div>
  );
};

export default Brand;