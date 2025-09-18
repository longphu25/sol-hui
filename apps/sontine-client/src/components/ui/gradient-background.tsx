'use client';

import React from 'react';

export interface GradientBackgroundProps {
  variant?: 'primary-accent' | 'navy-primary' | 'dark-primary' | 'accent-light' | 'full-spectrum' | 'subtle-mint';
  children?: React.ReactNode;
  className?: string;
}

export function GradientBackground({ variant = 'primary-accent', children, className = '' }: GradientBackgroundProps) {
  const getGradientClass = () => {
    switch (variant) {
      case 'primary-accent':
        return 'bg-gradient-to-br from-[#00B49F] to-[#00E6CC]'; // Green to bright mint
      case 'navy-primary':
        return 'bg-gradient-to-br from-[#134158] to-[#00B49F]'; // Navy to green
      case 'dark-primary':
        return 'bg-gradient-to-br from-[#0E151A] to-[#00B49F]'; // Darkest to green
      case 'accent-light':
        return 'bg-gradient-to-br from-[#00E6CC] to-[#8DFFF0]'; // Bright mint to light mint
      case 'full-spectrum':
        return 'bg-gradient-to-br from-[#0E151A] via-[#134158] via-[#00B49F] via-[#00E6CC] to-[#8DFFF0]'; // Full gradient
      case 'subtle-mint':
        return 'bg-gradient-to-br from-[#8DFFF0] to-[#C5FFF8]'; // Light mint to lightest mint
      default:
        return 'bg-gradient-to-br from-[#00B49F] to-[#00E6CC]';
    }
  };

  return (
    <div className={`${getGradientClass()} ${className}`}>
      {children}
    </div>
  );
}

// Utility component for gradient overlays
export function GradientOverlay({
  variant = 'primary-accent',
  opacity = 0.1,
  className = '',
}: GradientBackgroundProps & { opacity?: number }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <GradientBackground 
        variant={variant} 
        className={`opacity-${Math.round(opacity * 100)}`} 
      />
    </div>
  );
}

// Additional gradient utilities for modern web design
export function HeroGradient({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-[#0E151A] via-[#134158] to-[#00B49F] ${className}`}>
      {children}
    </div>
  );
}

export function CardGradient({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 ${className}`}>
      {children}
    </div>
  );
}

export function ButtonGradient({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-[#00B49F] to-[#00E6CC] hover:from-[#00A08A] hover:to-[#00B49F] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}