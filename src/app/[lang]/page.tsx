
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Globe, Menu, CheckCircle, MoveRight, Quote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDictionary } from '@/lib/get-dictionary';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggleButton } from '@/components/home/theme-toggle-button';
import { AnimatedFeaturesLoader } from '@/components/home/animated-features-loader';


export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const homeDict = dict.homePage;

  const navLinks = [
    { href: `/${lang}`, label: homeDict.nav.home },
    { href: `/${lang}/features`, label: homeDict.nav.features },
    { href: `/${lang}/pricing`, label: homeDict.nav.pricing },
    { href: `/${lang}/faq`, label: homeDict.nav.help },
  ];
  
  const langLinks = [
    { lang: 'en' as Locale, label: 'English', flag: <svg width="20" height="15" viewBox="0 0 20 15"><rect width="20" height="15" fill="#012169"/><path d="M0,0L20,15M20,0L0,15" stroke="#fff" strokeWidth="3"/><path d="M0,0L20,15M20,0L0,15" stroke="#C8102E" strokeWidth="2"/><path d="M10,0V15M0,7.5H20" stroke="#fff" strokeWidth="5"/><path d="M10,0V15M0,7.5H20" stroke="#C8102E" strokeWidth="3"/></svg> },
    { lang: 'fr' as Locale, label: 'Français', flag: <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#002395" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ED2939" d="M2 0h1v2H2z"/></svg> },
    { lang: 'de' as Locale, label: 'Deutsch', flag: <svg width="20" height="15" viewBox="0 0 5 3"><path fill="#000" d="M0 0h5v3H0z"/><path fill="#D00" d="M0 1h5v2H0z"/><path fill="#FFCE00" d="M0 2h5v1H0z"/></svg> },
    { lang: 'es' as Locale, label: 'Español', flag: <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#C60B1E" d="M0 0h3v2H0z"/><path fill="#FFC400" d="M0 .5h3v1H0z"/></svg> },
    { lang: 'pt' as Locale, label: 'Português', flag: <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#006600" d="M0 0h3v2H0z"/><path fill="#f00" d="M0 0h1v2H0z"/></svg> }
  ];
  
  const testimonials = [
    { ...homeDict.testimonialsSection.testimonial1, avatar: "https://res.cloudinary.com/dxvbuhadg/image/upload/v1750971442/smiling_group_with_heads_-_Copie_yosxfs.png", hint: "woman portrait" },
    { ...homeDict.testimonialsSection.testimonial2, avatar: "https://res.cloudinary.com/dxvbuhadg/image/upload/v1750971442/smiling_group_with_heads_gwigvs.png", hint: "man portrait" },
    { ...homeDict.testimonialsSection.testimonial3, avatar: "https://res.cloudinary.com/dxvbuhadg/image/upload/v1750971442/smiling_group_with_heads_-_Copie_2_yilnmp.png", hint: "woman smiling" }
  ];

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-primary/95 to-primary-gradient-end/95 text-primary-foreground backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
            <Link href={`/${lang}`} className="flex items-center gap-4">
            <Logo text={dict.logo} />
            <div>
                <h1 className="text-xl font-bold font-headline">{dict.logo}</h1>
                <p className="hidden text-sm text-primary-foreground/80 sm:block">{homeDict.slogan}</p>
            </div>
            </Link>
            <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {navLinks.map((link) => (
                <Button variant="ghost" asChild key={link.href} className="hover:bg-primary-foreground/10 active:bg-primary-foreground/20">
                <Link href={link.href}>
                    {link.label}
                </Link>
                </Button>
            ))}
            </nav>
            <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 active:bg-primary-foreground/20">
                <Link href={`/${lang}/login`}>{homeDict.nav.login}</Link>
            </Button>
            <Button asChild>
                <Link href={`/${lang}/register`}>{homeDict.nav.openAccount}</Link>
            </Button>
            <ThemeToggleButton />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10 active:bg-primary-foreground/20">
                    <Globe />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                {langLinks.map(({ lang: linkLang, label, flag }) => (
                    <DropdownMenuItem key={linkLang} asChild>
                    <Link href={`/${linkLang}`} className="flex items-center gap-2">
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
                <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b shrink-0">
                    <SheetTitle asChild>
                        <Link href={`/${lang}`} className="flex items-center gap-2 text-lg font-semibold">
                        <Logo text={dict.logo} />
                        <span>{dict.logo}</span>
                        </Link>
                    </SheetTitle>
                    <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                </SheetHeader>
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <nav className="grid gap-4 text-base font-medium">
                        {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                            {link.label}
                        </Link>
                        ))}
                    </nav>
                    <Separator />
                    <div className="grid gap-2">
                        <Button variant="outline" asChild className="w-full"><Link href={`/${lang}/login`}>{homeDict.nav.login}</Link></Button>
                        <Button asChild className="w-full"><Link href={`/${lang}/register`}>{homeDict.nav.openAccount}</Link></Button>
                    </div>
                    <Separator />
                    <div className="grid gap-4">
                        <p className="text-sm font-medium text-muted-foreground">{dict.settings.appearance.language}</p>
                        <nav className="grid gap-3">
                            {langLinks.map(({ lang: linkLang, label, flag }) => (
                                <Link key={linkLang} href={`/${linkLang}`} className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2 text-base">
                                    {flag}
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="overflow-y-auto">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 sm:py-16">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl md:text-6xl lg:text-7xl">
                {homeDict.hero.title_part1}<span className="text-primary">{homeDict.hero.title_highlight}</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:mx-0 md:text-xl">
                {homeDict.hero.subtitle}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href={`/${lang}/register`}>{homeDict.hero.ctaPrimary}</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href={`/${lang}/features`}>{homeDict.hero.ctaSecondary}</Link>
                </Button>
              </div>
            </div>
            <div>
              <div className="relative p-6 sm:p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-blue-900/20 dark:via-background dark:to-pink-900/20 overflow-hidden border">
                {/* Stars for decoration */}
                <svg className="absolute top-4 left-20 h-5 w-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} fill="currentColor" viewBox="0 0 20 20" data-ai-hint="star"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                <svg className="absolute bottom-12 right-24 h-4 w-4 text-blue-400 animate-pulse" style={{ animationDelay: '1s' }} fill="currentColor" viewBox="0 0 20 20" data-ai-hint="star"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-3 text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold font-headline text-primary">{homeDict.youthOffer.title}</h2>
                      <p className="text-muted-foreground">{homeDict.youthOffer.line1}</p>
                      <p className="text-muted-foreground text-sm">{homeDict.youthOffer.line2}</p>
                      <p className="text-muted-foreground text-sm">{homeDict.youthOffer.line3}</p>
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center shadow-lg w-40 flex-shrink-0">
                      <p className="text-2xl font-bold leading-none">{homeDict.youthOffer.offer_year}</p>
                      <p className="text-xs tracking-wide">{homeDict.youthOffer.offer_subscription}</p>
                      <div className="relative my-2 inline-block">
                        <span className="bg-red-500 text-white font-bold py-1 px-3 rounded-md shadow-md text-sm">{homeDict.youthOffer.offer_free}</span>
                      </div>
                      <div className="bg-cyan-400 text-white font-semibold py-1 px-3 rounded-full shadow-md text-xs w-fit mx-auto mt-2">
                        {homeDict.youthOffer.offer_commitment}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold font-headline">{homeDict.featuresSection.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750894509/im_zgycci.png" width={600} height={400} alt="Budgeting App" className="mb-4 rounded-lg transition-transform duration-300 hover:scale-105" data-ai-hint="budgeting app" />
                  <h3 className="text-xl font-bold font-headline">{homeDict.featuresSection.feature1.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{homeDict.featuresSection.feature1.description}</p>
                  <Button variant="link" className="p-0 h-auto mt-4 self-start" asChild>
                    <Link href={`/${lang}/register`}>{homeDict.featuresSection.feature1.cta} <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
               <Card className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750904313/idrg_kigadm.png" width={600} height={400} alt="Payment Cards" className="mb-4 rounded-lg transition-transform duration-300 hover:scale-105" data-ai-hint="payment card" />
                  <h3 className="text-xl font-bold font-headline">{homeDict.featuresSection.feature2.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{homeDict.featuresSection.feature2.description}</p>
                  <Button variant="link" className="p-0 h-auto mt-4 self-start" asChild>
                    <Link href={`/${lang}/register`}>{homeDict.featuresSection.feature2.cta} <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750897367/IM_5_xfdv9p.png" width={600} height={400} alt="AI Assistant" className="mb-4 rounded-lg transition-transform duration-300 hover:scale-105" data-ai-hint="finance app" />
                  <h3 className="text-xl font-bold font-headline">{homeDict.featuresSection.feature3.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{homeDict.featuresSection.feature3.description}</p>
                   <Button variant="link" className="p-0 h-auto mt-4 self-start" asChild>
                    <Link href={`/${lang}/register`}>{homeDict.featuresSection.feature3.cta} <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 sm:py-20">
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
                     <Link href={`/${lang}/register`}>{homeDict.pricingSection.account.cta}</Link>
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
                    <Link href={`/${lang}/register`}>{homeDict.pricingSection.bills.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-20">
            <div className="container mx-auto px-4">
                 <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold font-headline">{homeDict.testimonialsSection.title}</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardContent className="pt-6 flex-1">
                                <Quote className="h-8 w-8 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">
                                    "{testimonial.quote}"
                                </p>
                            </CardContent>
                            <CardFooter>
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="py-12 sm:py-20 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-headline mb-12">{homeDict.partnersSection.title}</h2>
            
            {/* Mobile View - visible on small screens, hidden on medium and up */}
             <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:hidden">
                <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882507/im_2_kptbng.jpg" width={120} height={40} alt="bunq logo" data-ai-hint="bunq logo" className="h-10 w-auto object-contain opacity-60" />
                <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882501/im_4_fpoqlg.png" width={120} height={40} alt="Crédit Agricole logo" data-ai-hint="Crédit Agricole logo" className="h-10 w-auto object-contain opacity-60" />
                <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882501/im_2_tdtu8c.png" width={120} height={40} alt="Crédit Mutuel logo" data-ai-hint="Crédit Mutuel logo" className="h-10 w-auto object-contain opacity-60" />
                <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882500/im_1_odx3zt.jpg" width={120} height={40} alt="Sogexia logo" data-ai-hint="Sogexia logo" className="h-10 w-auto object-contain opacity-60" />
                <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882500/im_1_ztlbyx.webp" width={120} height={40} alt="BNP Paribas logo" data-ai-hint="BNP Paribas logo" className="h-10 w-auto object-contain opacity-60" />
            </div>

            {/* Desktop View - hidden on small screens, visible on medium and up */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-16">
              <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882507/im_2_kptbng.jpg" width={140} height={50} alt="bunq logo" data-ai-hint="bunq logo" className="h-16 w-auto object-contain opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-110" />
              <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882501/im_4_fpoqlg.png" width={140} height={50} alt="Crédit Agricole logo" data-ai-hint="Crédit Agricole logo" className="h-16 w-auto object-contain opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-110" />
              <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882501/im_2_tdtu8c.png" width={140} height={50} alt="Crédit Mutuel logo" data-ai-hint="Crédit Mutuel logo" className="h-16 w-auto object-contain opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-110" />
              <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882500/im_1_odx3zt.jpg" width={140} height={50} alt="Sogexia logo" data-ai-hint="Sogexia logo" className="h-16 w-auto object-contain opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-110" />
              <Image src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750882500/im_1_ztlbyx.webp" width={140} height={50} alt="BNP Paribas logo" data-ai-hint="BNP Paribas logo" className="h-16 w-auto object-contain opacity-60 transition-all duration-300 hover:opacity-100 hover:scale-110" />
            </div>

             <div className="mt-16 max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold">{homeDict.partnersSection.invitation}</h3>
                <p className="mt-2 text-muted-foreground">{homeDict.partnersSection.description}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary to-primary-gradient-end text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-sm text-primary-foreground/80">{homeDict.footer.copyright}</p>
          <div className="flex gap-4 text-sm">
            <Link href="#" className="hover:underline text-primary-foreground/80 hover:text-primary-foreground">{homeDict.footer.legal}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
    
