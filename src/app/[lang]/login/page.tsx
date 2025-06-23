
import Link from 'next/link';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default async function LoginPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict: Dictionary = lang === 'fr' ? fr : en;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo text={dict.logo} />
          </div>
          <CardTitle className="text-2xl font-headline text-center">{dict.login.title}</CardTitle>
          <CardDescription className="text-center">{dict.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{dict.login.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={dict.login.emailPlaceholder}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{dict.login.passwordLabel}</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  {dict.login.forgotPassword}
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href={`/${lang}/dashboard`}>{dict.login.loginButton}</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {dict.login.registerPrompt}{' '}
            <Link href={`/${lang}/register`} className="underline">
              {dict.login.registerLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
