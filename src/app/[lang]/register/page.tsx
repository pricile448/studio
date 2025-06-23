
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterPage({ params: { lang } }: { params: { lang: Locale } }) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (!dict) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
            <Card className="mx-auto w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                        </div>
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                         <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-12 w-full mt-4" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const registerDict = dict.register;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo text={dict.logo} />
          </div>
          <CardTitle className="text-2xl font-headline">{registerDict.title}</CardTitle>
          <CardDescription>{registerDict.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">{registerDict.firstNameLabel}</Label>
                <Input id="first-name" placeholder={registerDict.firstNamePlaceholder} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">{registerDict.lastNameLabel}</Label>
                <Input id="last-name" placeholder={registerDict.lastNamePlaceholder} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="dob">{registerDict.dobLabel}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, 'PPP') : <span>{registerDict.dobPlaceholder}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pob">{registerDict.pobLabel}</Label>
                    <Input id="pob" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="nationality">{registerDict.nationalityLabel}</Label>
                    <Input id="nationality" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="residence">{registerDict.residenceCountryLabel}</Label>
                    <Input id="residence" required />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">{registerDict.addressLabel}</Label>
                <Input id="address" required />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="profession">{registerDict.professionLabel}</Label>
                    <Input id="profession" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="salary">{registerDict.salaryLabel}</Label>
                    <Input id="salary" type="number" placeholder="2000" required />
                </div>
            </div>
            
            <Separator className="my-2" />

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
          <Separator className="my-4" />
          <div className="text-center">
            <Button variant="link" asChild className="px-0">
              <Link href={`/${lang}`}>
                {dict.login.backToHome}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
