
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggleButton() {
  const [mounted, setMounted] = React.useState(false);
  // Default to 'light' on server and initial client render. It will be corrected on mount.
  const [theme, setTheme] = React.useState('light');

  // This effect runs only once on the client, after the component has mounted.
  React.useEffect(() => {
    setMounted(true);
    // Now that we're on the client, we can safely access localStorage.
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
    } else {
        // If no theme is stored or it's 'system', determine from browser preference.
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);


  // This effect applies the theme to the DOM and syncs localStorage.
  React.useEffect(() => {
    // Only run this logic after the component has mounted and the theme is determined.
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    // Simple toggle between light and dark
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // On the server and during initial client render, render a placeholder.
  // This prevents a hydration mismatch error.
  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  // Once mounted, render the actual button.
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <Sun /> : <Moon />}
    </Button>
  );
}
