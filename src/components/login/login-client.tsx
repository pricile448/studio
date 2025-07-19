
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
import { Loader2, LogOut, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Ajoutez ceci en haut de votre composant de login (après les imports)
useEffect(() => {
  console.log('🔥🔥🔥 DEBUG VARIABLES D\'ENVIRONNEMENT 🔥🔥🔥');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET ✅' : 'MISSING ❌');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET ✅' : 'MISSING ❌');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET ✅' : 'MISSING ❌');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET ✅' : 'MISSING ❌');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET ✅' : 'MISSING ❌');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET ✅' : 'MISSING ❌');
}, []);
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
  const [showPassword, setShowPassword] = useState(false);
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
    const result = await login(values.email, values.password);

    if (result.success) {
      router.push(`/${lang}/dashboard`);
    } else {
      const errorKey = result.error as keyof typeof dict.errors.messages.auth | keyof typeof dict.errors.messages.api;
      let message;

      if (errorKey in dict.errors.messages.auth) {
          message = dict.errors.messages.auth[errorKey as keyof typeof dict.errors.messages.auth];
      } else if (errorKey in dict.errors.messages.api) {
          message = dict.errors.messages.api[errorKey as keyof typeof dict.errors.messages.api];
      } else {
          message = dict.errors.messages.api.unexpected;
      }
      
      toast({
        variant: 'destructive',
        title: dict.errors.titles.loginFailed,
        description: message,
      });
    }
    setIsSubmitting(false);
  };
  
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
                     <div className="relative">
                        <FormControl>
                            <Input id="password" type={showPassword ? 'text' : 'password'} required {...field} />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                     </div>
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
