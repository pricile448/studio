'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggleButton() {
  // 1. Initialiser l'état à null pour que le rendu serveur et client initial soient identiques.
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    // 2. Ce code s'exécute uniquement sur le client, après l'hydratation.
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []); // Le tableau de dépendances vide garantit une exécution unique au montage.

  useEffect(() => {
    // 3. Cet effet applique la classe de thème à l'élément HTML lorsque le thème change.
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 4. Sur le serveur et au rendu client initial, afficher un bouton désactivé.
  // Cela empêche l'erreur de correspondance d'hydratation.
  if (theme === null) {
    return <Button variant="ghost" size="icon" disabled />;
  }

  // 5. Une fois monté et le thème déterminé, afficher le bouton réel.
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
