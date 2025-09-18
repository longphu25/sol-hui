'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SontineInputProps {
  variant?: 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeText?: (text: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export function SontineInput({
  variant = 'outlined',
  size = 'md',
  error = false,
  helperText,
  className = '',
  containerClassName = '',
  label,
  placeholder,
  value,
  type = 'text',
  disabled = false,
  required = false,
  onChange,
  onChangeText,
  onBlur,
  onFocus,
  startIcon,
  endIcon,
  ...props
}: SontineInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onChangeText?.(e.target.value);
  };

  const getInputClasses = () => {
    const baseClasses = 'w-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Size classes
    let sizeClasses = '';
    switch (size) {
      case 'sm':
        sizeClasses = 'h-9 text-sm';
        break;
      case 'lg':
        sizeClasses = 'h-14 text-lg';
        break;
      default:
        sizeClasses = 'h-12 text-base';
    }

    // Padding classes for icons
    let paddingClasses = 'px-4';
    if (startIcon && endIcon) {
      paddingClasses = 'pl-12 pr-12';
    } else if (startIcon) {
      paddingClasses = 'pl-12 pr-4';
    } else if (endIcon) {
      paddingClasses = 'pl-4 pr-12';
    }

    // Variant and error classes
    let variantClasses = '';
    let focusClasses = '';
    
    if (error) {
      if (variant === 'flat') {
        variantClasses = 'bg-red-50 border-2 border-red-300 text-red-900 placeholder-red-400';
        focusClasses = 'focus:ring-red-500/20 focus:border-red-500';
      } else {
        variantClasses = 'bg-white border-2 border-red-300 text-red-900 placeholder-red-400';
        focusClasses = 'focus:ring-red-500/20 focus:border-red-500';
      }
    } else {
      if (variant === 'flat') {
        variantClasses = 'bg-gray-50 border-2 border-transparent text-gray-900 placeholder-gray-500';
        focusClasses = 'focus:ring-[#00B49F]/20 focus:border-[#00B49F] focus:bg-white';
      } else {
        variantClasses = 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-500';
        focusClasses = 'focus:ring-[#00B49F]/20 focus:border-[#00B49F]';
      }
    }

    const roundedClasses = 'rounded-lg';

    return cn(baseClasses, sizeClasses, paddingClasses, variantClasses, focusClasses, roundedClasses, className);
  };

  const getContainerClasses = () => {
    return cn('relative', containerClassName);
  };

  const getIconClasses = (position: 'start' | 'end') => {
    const baseClasses = 'absolute top-1/2 transform -translate-y-1/2 pointer-events-none';
    const colorClasses = error ? 'text-red-400' : 'text-gray-400';
    const positionClasses = position === 'start' ? 'left-4' : 'right-4';
    
    return cn(baseClasses, colorClasses, positionClasses);
  };

  return (
    <div className={getContainerClasses()}>
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2',
          error ? 'text-red-700' : 'text-gray-700'
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className={getIconClasses('start')}>
            {startIcon}
          </div>
        )}
        
        <input
          type={type}
          className={getInputClasses()}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          {...props}
        />
        
        {endIcon && (
          <div className={getIconClasses('end')}>
            {endIcon}
          </div>
        )}
      </div>
      
      {helperText && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
}

// Specialized input variants
export function SontineAmountInput(props: Omit<SontineInputProps, 'type' | 'endIcon'>) {
  return (
    <SontineInput
      type="number"
      endIcon={<span className="text-sm font-medium text-gray-500">USDC</span>}
      {...props}
    />
  );
}

export function SontineSearchInput(props: Omit<SontineInputProps, 'startIcon'>) {
  return (
    <SontineInput
      startIcon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      {...props}
    />
  );
}