
'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState('light');

  // After mounting on the client, we can safely access localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setThemeState(storedTheme);
    setMounted(true);
  }, []);
  
  // When theme changes, update the document class and localStorage
  useEffect(() => {
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
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Render a placeholder on the server and on initial client render
  // to prevent a hydration mismatch.
  if (!mounted) {
    return <Skeleton className="h-10 w-10 rounded-md" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
