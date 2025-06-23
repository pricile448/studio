
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    dob: z.date({ required_error: 'Date of birth is required.' }),
    pob: z.string().min(1, 'Place of birth is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    residenceCountry: z.string().min(1, 'Country of residence is required'),
    address: z.string().min(1, 'Address is required'),
    profession: z.string().min(1, 'Profession is required'),
    salary: z.coerce.number().positive('Salary must be a positive number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function RegisterPage({ params: { lang } }: { params: { lang: Locale } }) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      pob: '',
      nationality: '',
      residenceCountry: '',
      address: '',
      profession: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const { password, confirmPassword, terms, ...userData } = data;
      await signup(userData, password);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: dict?.register.registerErrorTitle || 'Registration Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{registerDict.firstNameLabel}</FormLabel>
                    <FormControl><Input placeholder={registerDict.firstNamePlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{registerDict.lastNameLabel}</FormLabel>
                    <FormControl><Input placeholder={registerDict.lastNamePlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>{registerDict.dobLabel}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, 'PPP') : <span>{registerDict.dobPlaceholder}</span>}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus/>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="pob" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{registerDict.pobLabel}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="nationality" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.nationalityLabel}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="residenceCountry" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.residenceCountryLabel}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              </div>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>{registerDict.addressLabel}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="profession" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.professionLabel}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="salary" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.salaryLabel}</FormLabel>
                        <FormControl><Input type="number" placeholder="2000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              </div>
              
              <Separator className="my-2" />
              
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.login.emailLabel}</FormLabel>
                  <FormControl><Input type="email" placeholder={dict.login.emailPlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.login.passwordLabel}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>{registerDict.confirmPasswordLabel}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="terms" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                      <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal text-muted-foreground">
                              {registerDict.termsPrompt}{' '}
                              <Link href="#" className="underline font-medium text-primary hover:text-primary/90">
                                  {registerDict.termsLink}
                              </Link>
                          </FormLabel>
                           <FormMessage />
                      </div>
                  </FormItem>
              )}/>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {registerDict.createAccountButton}
              </Button>
            </form>
          </Form>
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
