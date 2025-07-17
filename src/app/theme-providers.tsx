
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';

export function ThemeProviders({ children }: { children: ReactNode }) {
    const themeProps: ThemeProviderProps = {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
    };

    return (
        <NextThemesProvider {...themeProps}>
            {children}
            <Toaster />
        </NextThemesProvider>
    );

    const themeProps: ThemeProviderProps = {
        attribute: 'class',
        defaultTheme: 'system',
        enableSystem: true,
        disableTransitionOnChange: true,
        children: null, // Ajoutez cette ligne
      };
}
