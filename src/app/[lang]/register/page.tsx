
import Link from 'next/link';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default async function RegisterPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict: Dictionary = lang === 'fr' ? fr : en;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo text={dict.logo} />
          </div>
          <CardTitle className="text-2xl font-headline">{dict.register.title}</CardTitle>
          <CardDescription>{dict.register.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Coming soon!</p>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/login`}>Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
