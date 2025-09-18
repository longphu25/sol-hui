'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SontineCardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'primary' | 'accent' | 'mint' | 'navy';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function SontineCard({ 
  variant = 'default', 
  padding = 'md', 
  className = '', 
  children, 
  onClick,
  ...props 
}: SontineCardProps) {
  const getCardClasses = () => {
    const baseClasses = 'rounded-xl transition-all duration-200';
    
    // Apply padding
    let paddingClasses = '';
    switch (padding) {
      case 'none':
        paddingClasses = '';
        break;
      case 'sm':
        paddingClasses = 'p-3';
        break;
      case 'md':
        paddingClasses = 'p-4';
        break;
      case 'lg':
        paddingClasses = 'p-6';
        break;
    }

    // Apply variant styles
    let variantClasses = '';
    switch (variant) {
      case 'elevated':
        variantClasses = 'bg-white shadow-lg hover:shadow-xl border-0';
        break;
      case 'outlined':
        variantClasses = 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm';
        break;
      case 'primary':
        variantClasses = 'bg-[#00B49F] text-white shadow-md hover:shadow-lg';
        break;
      case 'accent':
        variantClasses = 'bg-[#00E6CC] text-gray-900 shadow-md hover:shadow-lg';
        break;
      case 'mint':
        variantClasses = 'bg-[#8DFFF0] text-gray-900 shadow-md hover:shadow-lg';
        break;
      case 'navy':
        variantClasses = 'bg-[#134158] text-white shadow-md hover:shadow-lg';
        break;
      default:
        variantClasses = 'bg-white shadow-md hover:shadow-lg border border-gray-100';
    }

    const interactiveClasses = onClick ? 'cursor-pointer hover:scale-[1.02]' : '';

    return cn(baseClasses, paddingClasses, variantClasses, interactiveClasses, className);
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={getCardClasses()} 
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card Content Components
export function SontineCardContent({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

export function SontineCardActions({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('flex items-center justify-end space-x-2 pt-4', className)} {...props}>
      {children}
    </div>
  );
}

export function SontineCardHeader({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('pb-3 border-b border-gray-100', className)} {...props}>
      {children}
    </div>
  );
}

export function SontineCardTitle({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function SontineCardDescription({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <p className={cn('text-sm text-gray-600', className)} {...props}>
      {children}
    </p>
  );
}