
import { use } from 'react';
import Link from 'next/link';
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

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function PricingPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = use(getDictionary(lang));
  const homeDict = dict.homePage;

  const navLinks = [
    { href: `/${params.lang}`, label: homeDict.nav.home },
    { href: `/${params.lang}/features`, label: homeDict.nav.features },
    { href: `/${params.lang}/pricing`, label: homeDict.nav.pricing },
    { href: `/${params.lang}/faq`, label: homeDict.nav.help },
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
              <DropdownMenuItem asChild><Link href="/en/pricing">English</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/fr/pricing">Français</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/de/pricing">Deutsch</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/es/pricing">Español</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/pt/pricing">Português</Link></DropdownMenuItem>
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
                  <Link href="/en/pricing" className="text-muted-foreground transition-colors hover:text-foreground">English</Link>
                  <Link href="/fr/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Français</Link>
                  <Link href="/de/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Deutsch</Link>
                  <Link href="/es/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Español</Link>
                  <Link href="/pt/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Português</Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Pricing Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold font-headline">{homeDict.pricingSection.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:items-start">
              {/* Account Card */}
              <Card className="flex flex-col shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold font-headline">{homeDict.pricingSection.account.title}</CardTitle>
                  <CardDescription>{homeDict.pricingSection.account.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-3">
                    {homeDict.pricingSection.account.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-center gap-4 pt-6">
                  <p className="text-4xl font-bold text-primary">{homeDict.pricingSection.account.price}</p>
                  <Button size="lg" className="w-full" asChild>
                     <Link href={`/${params.lang}/register`}>{homeDict.pricingSection.account.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Bills Card */}
              <Card className="flex flex-col shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold font-headline">{homeDict.pricingSection.bills.title}</CardTitle>
                  <CardDescription>{homeDict.pricingSection.bills.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-3">
                    {homeDict.pricingSection.bills.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-center gap-4 pt-6">
                  <p className="text-4xl font-bold text-primary">{homeDict.pricingSection.bills.price}</p>
                  <Button size="lg" className="w-full" asChild>
                    <Link href={`/${params.lang}/register`}>{homeDict.pricingSection.bills.cta}</Link>
                  </Button>
                </CardFooter>
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
