
import Link from 'next/link';
import { type Locale } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/logo';
import { getDictionary } from '@/lib/get-dictionary';

export default async function RegisterPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const registerDict = dict.register;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo text={dict.logo} />
          </div>
          <CardTitle className="text-2xl font-headline">{registerDict.title}</CardTitle>
          <CardDescription>{registerDict.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">{registerDict.firstNameLabel}</Label>
                <Input id="first-name" placeholder={registerDict.firstNamePlaceholder} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">{registerDict.lastNameLabel}</Label>
                <Input id="last-name" placeholder={registerDict.lastNamePlaceholder} required />
              </div>
            </div>
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
              <Label htmlFor="password">{dict.login.passwordLabel}</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="confirm-password">{registerDict.confirmPasswordLabel}</Label>
                <Input id="confirm-password" type="password" required />
            </div>
            <div className="flex items-start space-x-2 my-2">
                <Checkbox id="terms" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                        {registerDict.termsPrompt}{' '}
                        <Link href="#" className="underline font-medium text-primary hover:text-primary/90">
                            {registerDict.termsLink}
                        </Link>
                    </Label>
                </div>
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href={`/${lang}/dashboard`}>{registerDict.createAccountButton}</Link>
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {registerDict.loginPrompt}
            <Link href={`/${lang}/login`} className="underline">
              {' '}{registerDict.loginLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
