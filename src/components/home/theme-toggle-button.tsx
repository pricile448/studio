
'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export function ThemeToggleButton() {
  const [theme, setThemeState] = useState('light');

  // Effect to set initial theme from localStorage or default to 'light'
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setThemeState(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
