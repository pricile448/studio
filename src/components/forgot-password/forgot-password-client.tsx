
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
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, MailCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const forgotPasswordSchema = (dict: any) => z.object({
  email: z.string().email({ message: dict.emailInvalid }),
});

type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;

interface ForgotPasswordClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function ForgotPasswordClient({ dict, lang }: ForgotPasswordClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const forgotPasswordDict = dict.forgotPassword;
  const errorDict = dict.errors;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema(forgotPasswordDict)),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: { email: string }) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSuccess(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: errorDict.titles.unexpected,
        description: errorDict.messages.api.unexpected,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4 text-2xl font-headline">{forgotPasswordDict.successTitle}</CardTitle>
            <CardDescription>
              {forgotPasswordDict.successDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="link" asChild>
              <Link href={`/${lang}/login`}>
                {dict.login.backToLogin}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Link href={`/${lang}`}>
              <Logo text={dict.logo} />
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline text-center">{forgotPasswordDict.title}</CardTitle>
          <CardDescription className="text-center">{forgotPasswordDict.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">{dict.login.emailLabel}</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder={dict.login.emailPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {forgotPasswordDict.submitButton}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            <Button variant="link" asChild className="px-0">
                <Link href={`/${lang}/login`}>
                   {dict.login.backToLogin}
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
