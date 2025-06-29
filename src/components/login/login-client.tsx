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
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function LoginClient({ dict, lang }: LoginClientProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push(`/${lang}/dashboard`);
    } catch (error: any) {
      const loginDict = dict?.login;
      let description = 'An unexpected error occurred.';
      if (error.message === 'auth/email-not-verified') {
        description = loginDict?.verifyEmailError || 'Please verify your email before logging in.';
      } else if (error.message) {
        description = error.message;
      }
       
      toast({
        variant: 'destructive',
        title: loginDict?.loginErrorTitle || 'Login Failed',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!dict) {
     return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Skeleton className="h-10 w-10" />
                    </div>
                     <Skeleton className="h-7 w-24 mx-auto" />
                     <Skeleton className="h-4 w-48 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="grid gap-4">
                     <Skeleton className="h-10" />
                     <Skeleton className="h-10" />
                     <Skeleton className="h-10" />
                </CardContent>
            </Card>
        </div>
     )
  }
  
  const loginDict = dict.login;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Link href={`/${lang}`}>
              <Logo text={dict.logo} />
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline text-center">{loginDict.title}</CardTitle>
          <CardDescription className="text-center">{loginDict.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {reason === 'inactivity' && (
              <Alert variant="info" className="mb-4">
                  <LogOut className="h-4 w-4" />
                  <AlertTitle>{loginDict.inactivityLogoutTitle}</AlertTitle>
                  <AlertDescription>
                      {loginDict.inactivityLogoutDescription}
                  </AlertDescription>
              </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">{loginDict.emailLabel}</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder={loginDict.emailPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                       <Label htmlFor="password">{loginDict.passwordLabel}</Label>
                       <Link href={`/${lang}/forgot-password`} className="ml-auto inline-block text-sm underline">
                        {loginDict.forgotPassword}
                      </Link>
                    </div>
                     <FormControl>
                        <Input id="password" type="password" required {...field} />
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loginDict.loginButton}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {loginDict.registerPrompt}{' '}
            <Link href={`/${lang}/register`} className="underline">
              {loginDict.registerLink}
            </Link>
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <Button variant="link" asChild className="px-0">
              <Link href={`/${lang}`}>
                {loginDict.backToHome}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
