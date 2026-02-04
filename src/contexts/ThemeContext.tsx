"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { CardType } from '@/lib/types';

// Theme values that ProductCard and other components need
export interface StorefrontTheme {
  primaryColor: string;
  cardType: CardType;
  borderRadius: string;
  glassMode: boolean;
  cardBgColor: string;
}

// Default theme values (fallbacks)
const defaultTheme: StorefrontTheme = {
  primaryColor: '#f97316',
  cardType: 'tech',
  borderRadius: '1rem',
  glassMode: false,
  cardBgColor: '#FFFFFF',
};

const ThemeContext = createContext<StorefrontTheme>(defaultTheme);

// Hook for consuming theme in components
export const useStorefrontTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return defaults if used outside provider
    return defaultTheme;
  }
  return context;
};

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
  theme: Partial<StorefrontTheme>;
}

export const StorefrontThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  const mergedTheme: StorefrontTheme = {
    ...defaultTheme,
    ...theme,
  };

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};
