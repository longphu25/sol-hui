'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SontineButtonProps {
  variant?: 'primary' | 'accent' | 'navy' | 'mint' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export function SontineButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon,
  ...props
}: SontineButtonProps) {
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Size classes
    let sizeClasses = '';
    switch (size) {
      case 'sm':
        sizeClasses = 'h-9 px-4 text-sm';
        break;
      case 'lg':
        sizeClasses = 'h-13 px-8 text-lg';
        break;
      default:
        sizeClasses = 'h-11 px-6 text-base';
    }

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Variant classes
    let variantClasses = '';
    let focusClasses = '';
    
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-[#00B49F] text-white hover:bg-[#00A08A] active:bg-[#008A7A]';
        focusClasses = 'focus:ring-[#00B49F]/20';
        break;
      case 'accent':
        variantClasses = 'bg-[#00E6CC] text-gray-900 hover:bg-[#00D4BA] active:bg-[#00C2A8]';
        focusClasses = 'focus:ring-[#00E6CC]/20';
        break;
      case 'navy':
        variantClasses = 'bg-[#134158] text-white hover:bg-[#0F3448] active:bg-[#0B2738]';
        focusClasses = 'focus:ring-[#134158]/20';
        break;
      case 'mint':
        variantClasses = 'bg-[#8DFFF0] text-gray-900 hover:bg-[#7BEDE0] active:bg-[#69DBC0]';
        focusClasses = 'focus:ring-[#8DFFF0]/20';
        break;
      case 'outline':
        variantClasses = 'border-2 border-[#00B49F] text-[#00B49F] bg-transparent hover:bg-[#00B49F] hover:text-white';
        focusClasses = 'focus:ring-[#00B49F]/20';
        break;
      case 'ghost':
        variantClasses = 'text-[#00B49F] bg-transparent hover:bg-[#00B49F]/10 active:bg-[#00B49F]/20';
        focusClasses = 'focus:ring-[#00B49F]/20';
        break;
      default:
        variantClasses = 'bg-[#00B49F] text-white hover:bg-[#00A08A] active:bg-[#008A7A]';
        focusClasses = 'focus:ring-[#00B49F]/20';
    }

    return cn(baseClasses, sizeClasses, widthClasses, variantClasses, focusClasses, className);
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

// SontineActionButton with loading functionality
export interface SontineActionButtonProps extends SontineButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function SontineActionButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  onClick,
  icon,
  ...props
}: SontineActionButtonProps) {
  const getLoadingIcon = () => {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  };

  return (
    <SontineButton
      disabled={disabled || isLoading}
      onClick={isLoading ? undefined : onClick}
      icon={isLoading ? getLoadingIcon() : icon}
      {...props}
    >
      {isLoading && loadingText ? loadingText : children}
    </SontineButton>
  );
}

// Gradient button variant
export function SontineGradientButton({
  children,
  className = '',
  ...props
}: SontineButtonProps) {
  return (
    <SontineButton
      className={cn(
        'bg-gradient-to-r from-[#00B49F] to-[#00E6CC] hover:from-[#00A08A] hover:to-[#00D4BA] text-white',
        className
      )}
      {...props}
    >
      {children}
    </SontineButton>
  );
}