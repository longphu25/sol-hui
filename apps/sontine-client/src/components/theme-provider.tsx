'use client';

import React, { createContext, useContext, useState } from 'react';

interface ThemeColors {
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  fontFamily: {
    regular: string;
    bold: string;
    mono: string;
  };
  fontsLoaded: boolean;
}

const defaultTheme: ThemeContextType = {
  colors: {
    primary: '#00B49F',
    onPrimary: '#FFFFFF',
    secondary: '#6B7280',
    onSecondary: '#FFFFFF',
    background: '#FFFFFF',
    onBackground: '#000000',
    surface: '#F9FAFB',
    onSurface: '#000000',
  },
  fontFamily: {
    regular: 'var(--font-inter)',
    bold: 'var(--font-inter)',
    mono: 'var(--font-inter)',
  },
  fontsLoaded: true,
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useState<ThemeContextType>(defaultTheme);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}