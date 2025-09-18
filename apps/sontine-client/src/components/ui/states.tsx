'use client';

import React from 'react';

interface LoadingStateProps {
  items?: number;
  height?: string;
  className?: string;
}

export function LoadingState({ items = 3, height = 'h-4', className = '' }: LoadingStateProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`bg-gray-200 rounded ${height}`}></div>
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-red-600 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l16 16m0-16L16 32" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#00B49F] text-white rounded-lg hover:bg-[#00A08A] transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );
}