
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Globe, Menu, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDictionary } from '@/lib/get-dictionary';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSlider } from '@/components/home/hero-slider';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function HomePage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = use(getDictionary(lang));
  const homeDict = dict.homePage;

  const navLinks = [
    { href: `/${params.lang}`, label: homeDict.nav.home },
    { href: `/${params.lang}/features`, label: homeDict.nav.features },
    { href: `/${params.lang}/pricing`, label: homeDict.nav.pricing },
    { href: `/${params.lang}/faq`, label: homeDict.nav.help },
  ];
  
  const heroImages = [
    { 
      src: 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1750879373/img_5_vtwsf6.png',
      alt: 'Banking app on a phone',
      hint: 'mobile banking'
    },
    { 
      src: 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1750879373/img_4_ce9hxg.png',
      alt: 'Payment card and phone',
      hint: 'contactless payment'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      {/* Header */}
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href={`/${params.lang}`} className="flex items-center gap-4">
          <Logo text={dict.logo} />
          <div>
            <h1 className="text-xl font-bold font-headline">{dict.logo}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">{homeDict.slogan}</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" asChild>
            <Link href={`/${params.lang}/login`}>{homeDict.nav.login}</Link>
          </Button>
          <Button asChild>
            <Link href={`/${params.lang}/register`}>{homeDict.nav.openAccount}</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/en">English</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/fr">Français</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/de">Deutsch</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/es">Español</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/pt">Português</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="grid gap-6 text-lg font-medium p-6">
                <Link href={`/${params.lang}`} className="flex items-center gap-2 text-lg font-semibold">
                  <Logo text={dict.logo} />
                  <span>{dict.logo}</span>
                </Link>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
                <Separator className="my-4" />
                <div className="flex flex-col gap-4">
                  <Button variant="outline" asChild><Link href={`/${params.lang}/login`}>{homeDict.nav.login}</Link></Button>
                  <Button asChild><Link href={`/${params.lang}/register`}>{homeDict.nav.openAccount}</Link></Button>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">{dict.settings.appearance.language}</p>
                  <Link href="/en" className="text-muted-foreground transition-colors hover:text-foreground">English</Link>
                  <Link href="/fr" className="text-muted-foreground transition-colors hover:text-foreground">Français</Link>
                  <Link href="/de" className="text-muted-foreground transition-colors hover:text-foreground">Deutsch</Link>
                  <Link href="/es" className="text-muted-foreground transition-colors hover:text-foreground">Español</Link>
                  <Link href="/pt" className="text-muted-foreground transition-colors hover:text-foreground">Português</Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 sm:py-32">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl md:text-6xl lg:text-7xl">
                {homeDict.hero.title_part1}<span className="text-primary">{homeDict.hero.title_highlight}</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:mx-0 md:text-xl">
                {homeDict.hero.subtitle}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href={`/${params.lang}/register`}>{homeDict.hero.ctaPrimary}</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href={`/${params.lang}/features`}>{homeDict.hero.ctaSecondary}</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <HeroSlider images={heroImages} />
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="py-20 sm:py-32 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-headline mb-12">{homeDict.partnersSection.title}</h2>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12">
              <Image src="https://placehold.co/140x50.png" width={140} height={50} alt="Partner Logo 1" data-ai-hint="logo company" className="opacity-60 hover:opacity-100 transition-opacity" />
              <Image src="https://placehold.co/140x50.png" width={140} height={50} alt="Partner Logo 2" data-ai-hint="logo company" className="opacity-60 hover:opacity-100 transition-opacity" />
              <Image src="https://placehold.co/140x50.png" width={140} height={50} alt="Partner Logo 3" data-ai-hint="logo company" className="opacity-60 hover:opacity-100 transition-opacity" />
              <Image src="https://placehold.co/140x50.png" width={140} height={50} alt="Partner Logo 4" data-ai-hint="logo company" className="opacity-60 hover:opacity-100 transition-opacity" />
              <Image src="https://placehold.co/140x50.png" width={140} height={50} alt="Partner Logo 5" data-ai-hint="logo company" className="opacity-60 hover:opacity-100 transition-opacity" />
              <Image src="https://placehold.co/140x50.png" width={140} height={50} alt="Partner Logo 6" data-ai-hint="logo company" className="opacity-60 hover:opacity-100 transition-opacity" />
            </div>
             <div className="mt-16 max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold">{homeDict.partnersSection.invitation}</h3>
                <p className="mt-2 text-muted-foreground">{homeDict.partnersSection.description}</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">{homeDict.footer.copyright}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">{homeDict.footer.legal}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
