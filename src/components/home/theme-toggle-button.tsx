'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggleButton() {
  const [theme, setTheme] = React.useState<string | null>(null);

  React.useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = storedTheme || systemTheme;
    setTheme(currentTheme);
  }, []);

  React.useEffect(() => {
    // This effect applies the theme class to the document whenever the theme state changes.
    if (theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Render a placeholder on the server and during initial client render to avoid layout shift.
  if (!theme) {
    return <div className="h-10 w-10" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <Sun /> : <Moon />}
    </Button>
  );
}
