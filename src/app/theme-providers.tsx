'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';

interface ThemeProvidersProps {
  children: ReactNode;
}

export function ThemeProviders({ children }: ThemeProvidersProps) {
  // Nous n'avons pas besoin de définir children dans baseThemeProps car nous le passons directement
  // à NextThemesProvider dans le JSX ci-dessous
  const baseThemeProps = {
    attribute: 'class',
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: true,
  };

  return (
    <NextThemesProvider {...baseThemeProps}>
      {children}
      <Toaster />
    </NextThemesProvider>
  );
}
