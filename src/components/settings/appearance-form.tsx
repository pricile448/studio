
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Dictionary, Locale } from '@/lib/dictionaries';

interface AppearanceFormProps {
  dict: Dictionary['settings']['appearance'];
  lang: Locale;
}

export function AppearanceForm({ dict, lang }: AppearanceFormProps) {
  const [theme, setTheme] = useState('system');
  const pathname = usePathname();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'system';
    setTheme(storedTheme);
    if (storedTheme === 'dark' || (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  const getNewPath = (newLang: Locale) => {
    const pathParts = pathname.split('/');
    pathParts[1] = newLang;
    return pathParts.join('/');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>{dict.theme}</Label>
        <RadioGroup
          defaultValue={theme}
          onValueChange={handleThemeChange}
          className="grid max-w-md grid-cols-1 sm:grid-cols-3 gap-8 pt-2"
        >
          <Label className="[&:has([data-state=checked])>div]:border-primary">
            <RadioGroupItem value="light" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
              </div>
            </div>
            <span className="block w-full p-2 text-center font-normal">{dict.themeLight}</span>
          </Label>
          <Label className="[&:has([data-state=checked])>div]:border-primary">
            <RadioGroupItem value="dark" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent">
              <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
              </div>
            </div>
            <span className="block w-full p-2 text-center font-normal">{dict.themeDark}</span>
          </Label>
           <Label className="[&:has([data-state=checked])>div]:border-primary">
            <RadioGroupItem value="system" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                <div className="flex items-center justify-center h-full bg-background rounded-md py-14">
                    <p>{dict.themeSystem}</p>
                </div>
            </div>
            <span className="block w-full p-2 text-center font-normal">{dict.themeSystem}</span>
          </Label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>{dict.language}</Label>
        <div className="flex flex-wrap gap-2 pt-2">
           <Button variant={lang === 'en' ? 'default' : 'outline'} asChild>
                <Link href={getNewPath('en')}>{dict.languageEn}</Link>
            </Button>
            <Button variant={lang === 'fr' ? 'default' : 'outline'} asChild>
                <Link href={getNewPath('fr')}>{dict.languageFr}</Link>
            </Button>
            <Button variant={lang === 'de' ? 'default' : 'outline'} asChild>
                <Link href={getNewPath('de')}>{dict.languageDe}</Link>
            </Button>
            <Button variant={lang === 'es' ? 'default' : 'outline'} asChild>
                <Link href={getNewPath('es')}>{dict.languageEs}</Link>
            </Button>
            <Button variant={lang === 'pt' ? 'default' : 'outline'} asChild>
                <Link href={getNewPath('pt')}>{dict.languagePt}</Link>
            </Button>
        </div>
      </div>
      
       <Button disabled>{dict.saveButton}</Button>
    </div>
  );
}
