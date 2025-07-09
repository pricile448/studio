
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../ui/input-otp';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const verifyCodeSchema = (dict: any) => z.object({
  code: z.string().min(6, { message: dict.codeInvalidError }),
});

interface VerifyEmailClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function VerifyEmailClient({ dict, lang }: VerifyEmailClientProps) {
  const { user, loading, resendVerificationEmail, logout, verifyCode } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof verifyCodeSchema>>>({
    resolver: zodResolver(verifyCodeSchema(dict.verifyEmail)),
    defaultValues: { code: '' },
  });

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
        await resendVerificationEmail();
        toast({
            title: dict?.verifyEmail.emailSent || 'E-mail envoyé !',
            description: dict?.verifyEmail.emailSentDescription || 'Un nouvel e-mail de vérification a été envoyé à votre adresse.',
        });
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Erreur',
            description: error.message,
        });
    } finally {
        setIsResending(false);
    }
  }

  const handleProceedToLogin = async () => {
    // No need to logout, user state is not fully "logged in" yet from UI perspective.
    // AuthProvider will handle the state change on login page.
    router.push(`/${lang}/login`);
  }
  
  const onSubmit = async (data: z.infer<ReturnType<typeof verifyCodeSchema>>) => {
    setIsSubmitting(true);
    const result = await verifyCode(data.code);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccessDialog(true);
    } else {
      toast({
        variant: 'destructive',
        title: "La vérification a échoué",
        description: result.error || "Une erreur inconnue est survenue.",
      });
    }
  };

  if (loading || !dict || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
            <Skeleton className="h-7 w-48 mx-auto mt-4" />
            <Skeleton className="h-4 w-full max-w-sm mx-auto mt-2" />
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Skeleton className="h-10 w-40 mx-auto" />
            <Skeleton className="h-10 w-32 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const verifyDict = dict.verifyEmail;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-6 w-6 text-primary" />
            </div>
          <CardTitle className="mt-4 text-2xl font-headline">{verifyDict.title_code}</CardTitle>
          <CardDescription>
            {verifyDict.description_code.replace('{email}', user.email || '')}
            <br />
            {verifyDict.checkSpam}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{verifyDict.codeLabel}</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="mx-auto">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verifyDict.verifyButton}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            {verifyDict.noCodePrompt}{' '}
            <Button variant="link" onClick={handleResendEmail} disabled={isResending} className="p-0 h-auto">
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {verifyDict.resendButton}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{verifyDict.verificationSuccessTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {verifyDict.verificationSuccessDescription}
              <p className="mt-4 text-sm text-muted-foreground">
                {verifyDict.spamNote}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleProceedToLogin}>
              {verifyDict.proceedToLoginButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
