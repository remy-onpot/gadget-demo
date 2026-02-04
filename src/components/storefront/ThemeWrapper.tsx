"use client";

import { ReactNode } from 'react';
import { StorefrontThemeProvider, StorefrontTheme } from '@/contexts/ThemeContext';

interface Props {
  children: ReactNode;
  theme: Partial<StorefrontTheme>;
}

export const ThemeWrapper = ({ children, theme }: Props) => {
  return (
    <StorefrontThemeProvider theme={theme}>
      {children}
    </StorefrontThemeProvider>
  );
};
