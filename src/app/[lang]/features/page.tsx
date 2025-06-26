
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Globe, Menu, MoveRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDictionary } from '@/lib/get-dictionary';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function FeaturesPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = use(getDictionary(lang));
  const homeDict = dict.homePage;

  const navLinks = [
    { href: `/${params.lang}`, label: homeDict.nav.home },
    { href: `/${params.lang}/features`, label: homeDict.nav.features },
    { href: `/${params.lang}/pricing`, label: homeDict.nav.pricing },
    { href: `/${params.lang}/faq`, label: homeDict.nav.help },
  ];

  const langLinks = [
    { lang: 'en' as Locale, label: 'English', flag: <svg width="20" height="15" viewBox="0 0 20 15"><rect width="20" height="15" fill="#012169"/><path d="M0,0L20,15M20,0L0,15" stroke="#fff" strokeWidth="3"/><path d="M0,0L20,15M20,0L0,15" stroke="#C8102E" strokeWidth="2"/><path d="M10,0V15M0,7.5H20" stroke="#fff" strokeWidth="5"/><path d="M10,0V15M0,7.5H20" stroke="#C8102E" strokeWidth="3"/></svg> },
    { lang: 'fr' as Locale, label: 'Français', flag: <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#002395" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ED2939" d="M2 0h1v2H2z"/></svg> },
    { lang: 'de' as Locale, label: 'Deutsch', flag: <svg width="20" height="15" viewBox="0 0 5 3"><path fill="#000" d="M0 0h5v3H0z"/><path fill="#D00" d="M0 1h5v2H0z"/><path fill="#FFCE00" d="M0 2h5v1H0z"/></svg> },
    { lang: 'es' as Locale, label: 'Español', flag: <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#C60B1E" d="M0 0h3v2H0z"/><path fill="#FFC400" d="M0 .5h3v1H0z"/></svg> },
    { lang: 'pt' as Locale, label: 'Português', flag: <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#006600" d="M0 0h3v2H0z"/><path fill="#f00" d="M0 0h1v2H0z"/></svg> }
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
        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Button variant="ghost" asChild key={link.href}>
              <Link href={link.href}>
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
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
              {langLinks.map(({ lang, label, flag }) => (
                <DropdownMenuItem key={lang} asChild>
                  <Link href={`/en/features`} className="flex items-center gap-2">
                    {flag}
                    <span>{label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                 <SheetTitle className="sr-only">Menu</SheetTitle>
                 <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
              </SheetHeader>
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
                   {langLinks.map(({ lang, label, flag }) => (
                      <Link key={lang} href={`/${lang}/features`} className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2">
                        {flag}
                        <span>{label}</span>
                      </Link>
                    ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Features Section */}
        <section className="bg-muted/50 py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold font-headline">{homeDict.featuresSection.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750894509/im_zgycci.png" width={600} height={400} alt="Budgeting App" className="mb-4 rounded-lg" data-ai-hint="budgeting app" />
                  <h3 className="text-xl font-bold font-headline">{homeDict.featuresSection.feature1.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{homeDict.featuresSection.feature1.description}</p>
                  <Button variant="link" className="p-0 h-auto mt-4 self-start" asChild>
                    <Link href={`/${params.lang}/budgets`}>{homeDict.featuresSection.feature1.cta} <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
               <Card className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750904313/idrg_kigadm.png" width={600} height={400} alt="Payment Cards" className="mb-4 rounded-lg" data-ai-hint="payment card" />
                  <h3 className="text-xl font-bold font-headline">{homeDict.featuresSection.feature2.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{homeDict.featuresSection.feature2.description}</p>
                  <Button variant="link" className="p-0 h-auto mt-4 self-start" asChild>
                    <Link href={`/${params.lang}/cards`}>{homeDict.featuresSection.feature2.cta} <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750897367/IM_5_xfdv9p.png" width={600} height={400} alt="AI Assistant" className="mb-4 rounded-lg" data-ai-hint="finance app" />
                  <h3 className="text-xl font-bold font-headline">{homeDict.featuresSection.feature3.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{homeDict.featuresSection.feature3.description}</p>
                   <Button variant="link" className="p-0 h-auto mt-4 self-start" asChild>
                    <Link href={`/${params.lang}/support`}>{homeDict.featuresSection.feature3.cta} <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
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
