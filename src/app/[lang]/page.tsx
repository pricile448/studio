
import Link from 'next/link';
import { type Locale } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDictionary } from '@/lib/get-dictionary';

export default async function HomePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      {/* Header */}
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Logo text={dict.logo} />
          <div>
            <h1 className="text-xl font-bold font-headline">{dict.logo}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">{dict.homePage.slogan}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href={`/${lang}`} className="text-foreground/80 transition-colors hover:text-foreground">
            {dict.homePage.nav.home}
          </Link>
          <Link href="#features" className="text-foreground/80 transition-colors hover:text-foreground">
            {dict.homePage.nav.features}
          </Link>
          <Link href={`/${lang}/register`} className="text-foreground/80 transition-colors hover:text-foreground">
            {dict.homePage.nav.openAccount}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/${lang}/login`}>{dict.homePage.nav.login}</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/en">English</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/fr">Français</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/de">Deutsch</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/es">Español</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pt">Português</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
          <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl md:text-6xl lg:text-7xl">
            {dict.homePage.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            {dict.homePage.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={`/${lang}/register`}>{dict.homePage.hero.ctaPrimary}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="#features">{dict.homePage.hero.ctaSecondary}</Link>
            </Button>
          </div>
        </section>

        {/* Features Section Placeholder */}
        <section id="features" className="container mx-auto px-4 py-20">
           <div className="text-center">
             <h2 className="text-3xl font-bold font-headline">{dict.homePage.nav.features}</h2>
             <p className="mt-4 text-muted-foreground">More details coming soon!</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {dict.homePage.footer.copyright}
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">{dict.homePage.footer.legal}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
