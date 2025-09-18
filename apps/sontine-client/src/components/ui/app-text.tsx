'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AppTextProps {
  variant?: 'displayLarge' | 'displayMedium' | 'displaySmall' | 
            'headlineLarge' | 'headlineMedium' | 'headlineSmall' |
            'titleLarge' | 'titleMedium' | 'titleSmall' |
            'bodyLarge' | 'bodyMedium' | 'bodySmall' |
            'labelLarge' | 'labelMedium' | 'labelSmall';
  fontType?: 'sans' | 'mono' | 'auto';
  numeric?: boolean;
  className?: string;
  children?: React.ReactNode;
  as?: React.ElementType;
}

export function AppText({ 
  variant = 'bodyMedium', 
  fontType = 'auto', 
  numeric = false,
  className = '',
  children,
  as,
  ...props 
}: AppTextProps) {
  // Get appropriate HTML tag based on variant
  const getElement = (): React.ElementType => {
    if (as) return as;
    
    switch (variant) {
      case 'displayLarge':
      case 'displayMedium':
      case 'displaySmall':
        return 'h1';
      case 'headlineLarge':
      case 'headlineMedium':
        return 'h2';
      case 'headlineSmall':
        return 'h3';
      case 'titleLarge':
        return 'h4';
      case 'titleMedium':
        return 'h5';
      case 'titleSmall':
        return 'h6';
      default:
        return 'p';
    }
  };

  // Get font family classes
  const getFontClasses = () => {
    if (fontType === 'mono') return 'font-mono';
    if (fontType === 'sans') {
      const isBoldVariant = variant.includes('display') || variant.includes('headline') || variant.includes('title');
      return isBoldVariant ? 'font-bold' : 'font-normal';
    }

    // Auto selection logic
    if (fontType === 'auto') {
      if (numeric || variant.includes('label')) {
        return 'font-mono';
      }
      if (variant.includes('display') || variant.includes('headline') || variant.includes('title')) {
        return 'font-bold';
      }
      return 'font-normal';
    }

    return 'font-normal';
  };

  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'displayLarge':
        return 'text-5xl lg:text-6xl font-bold leading-tight';
      case 'displayMedium':
        return 'text-4xl lg:text-5xl font-bold leading-tight';
      case 'displaySmall':
        return 'text-3xl lg:text-4xl font-bold leading-tight';
      case 'headlineLarge':
        return 'text-2xl lg:text-3xl font-semibold leading-snug';
      case 'headlineMedium':
        return 'text-xl lg:text-2xl font-semibold leading-snug';
      case 'headlineSmall':
        return 'text-lg lg:text-xl font-semibold leading-snug';
      case 'titleLarge':
        return 'text-lg font-semibold leading-normal';
      case 'titleMedium':
        return 'text-base font-semibold leading-normal';
      case 'titleSmall':
        return 'text-sm font-semibold leading-normal';
      case 'bodyLarge':
        return 'text-base leading-relaxed';
      case 'bodyMedium':
        return 'text-sm leading-relaxed';
      case 'bodySmall':
        return 'text-xs leading-relaxed';
      case 'labelLarge':
        return 'text-sm font-medium leading-none';
      case 'labelMedium':
        return 'text-xs font-medium leading-none';
      case 'labelSmall':
        return 'text-xs font-medium leading-none uppercase tracking-wider';
      default:
        return 'text-sm leading-relaxed';
    }
  };

  const Element = getElement();
  const classes = cn(
    getFontClasses(),
    getVariantClasses(),
    'text-gray-900', // Default color, can be overridden
    className
  );

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
}

// Specialized text components
export function AppHeading({ 
  children, 
  level = 1, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const variants = {
    1: 'displayMedium',
    2: 'headlineLarge', 
    3: 'headlineMedium',
    4: 'titleLarge',
    5: 'titleMedium',
    6: 'titleSmall',
  } as const;

  return (
    <AppText 
      variant={variants[level]} 
      className={className}
      as={`h${level}` as React.ElementType}
      {...props}
    >
      {children}
    </AppText>
  );
}

export function AppLabel({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string;
}) {
  return (
    <AppText 
      variant="labelMedium" 
      className={cn('text-gray-600', className)}
      {...props}
    >
      {children}
    </AppText>
  );
}

export function AppCode({ 
  children, 
  className = '',
  ...props 
}: { 
  children?: React.ReactNode; 
  className?: string;
}) {
  return (
    <AppText 
      fontType="mono" 
      numeric
      className={cn('bg-gray-100 px-2 py-1 rounded text-gray-800', className)}
      as="code"
      {...props}
    >
      {children}
    </AppText>
  );
}