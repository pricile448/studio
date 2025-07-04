'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    dob: z.coerce.date({ required_error: 'A date of birth is required.' }),
    pob: z.string().min(1, 'Place of birth is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    residenceCountry: z.string().min(1, 'Country of residence is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
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

interface RegisterClientProps {
    dict: Dictionary;
    lang: Locale;
}

export function RegisterClient({ dict, lang }: RegisterClientProps) {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      pob: '',
      nationality: '',
      residenceCountry: '',
      address: '',
      city: '',
      postalCode: '',
      profession: '',
      salary: undefined,
      dob: undefined,
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
      router.push(`/${lang}/verify-email`);
    } catch (error: any) {
        const registerDict = dict?.register;
        let description = registerDict?.registerErrorDescription || 'An unexpected error occurred.';

        if (error.code === 'auth/email-already-in-use') {
            description = registerDict?.emailInUseError || 'This email is already in use by another account.';
        } else if (error.code === 'permission-denied') {
             description = registerDict?.permissionDeniedError || 'Missing or insufficient permissions. Please check your Firestore security rules.';
        } else if (error.message) {
            description = error.message;
        }

        toast({
            variant: 'destructive',
            title: registerDict?.registerErrorTitle || 'Registration Failed',
            description: description,
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
            <Link href={`/${lang}`}>
              <Logo text={dict.logo} />
            </Link>
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
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                    <FormLabel>{dict.login.emailLabel}</FormLabel>
                    <FormControl><Input type="email" placeholder={dict.login.emailPlaceholder} {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.phoneLabel}</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              </div>

               <Separator className="my-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{registerDict.dobLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="YYYY-MM-DD"
                          {...field}
                          value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                 <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.cityLabel}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="postalCode" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{registerDict.postalCodeLabel}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              </div>

              <Separator className="my-2" />

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
                        <FormControl><Input type="number" placeholder="2000" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              </div>
              
              <Separator className="my-2" />
              
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.login.passwordLabel}</FormLabel>
                  <div className="relative">
                    <FormControl><Input type={showPassword ? 'text' : 'password'} {...field} /></FormControl>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>{registerDict.confirmPasswordLabel}</FormLabel>
                  <div className="relative">
                    <FormControl><Input type={showConfirmPassword ? 'text' : 'password'} {...field} /></FormControl>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
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
