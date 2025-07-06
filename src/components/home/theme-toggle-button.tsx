
'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setThemeState(storedTheme);
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="h-10 w-10" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} suppressHydrationWarning>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
