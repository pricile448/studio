'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/context/auth-context';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailWarning, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';


const passwordResetSchema = (dict: any) => z.object({
  newPassword: z.string().min(6, dict.passwordLengthError),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: dict.passwordMismatchError,
  path: ['confirmPassword'],
});


interface AuthActionClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function AuthActionClient({ dict, lang }: AuthActionClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof passwordResetSchema>>>({
    resolver: zodResolver(passwordResetSchema(dict.forgotPassword)),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });


  useEffect(() => {
    if (!dict) return;

    const currentMode = searchParams.get('mode');
    const currentActionCode = searchParams.get('oobCode');
    
    setMode(currentMode);
    setActionCode(currentActionCode);

    if (currentMode === 'verifyEmail' && currentActionCode) {
      handleVerifyEmail(currentActionCode, dict.verifyEmail);
    } else if (currentMode === 'resetPassword' && currentActionCode) {
      handleVerifyPasswordReset(currentActionCode, dict.forgotPassword);
    } else {
      setError(dict.verifyEmail.invalidAction);
      setLoading(false);
    }
  }, [searchParams, dict]);

  const handleVerifyEmail = async (code: string, verifyDict: Dictionary['verifyEmail']) => {
    setLoading(true);
    setError(null);
    try {
      await applyActionCode(auth, code);
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      setError(verifyDict.expiredLinkError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasswordReset = async (code: string, forgotPasswordDict: Dictionary['forgotPassword']) => {
    setLoading(true);
    setError(null);
    try {
        await verifyPasswordResetCode(auth, code);
        // Code is valid, stay on this page to show the password reset form
    } catch (e: any) {
        console.error(e);
        setError(forgotPasswordDict.expiredLinkError);
    } finally {
        setLoading(false);
    }
  }
  
  const handleProceedToLogin = () => {
    logout(); 
    router.push(`/${lang}/login`);
  };

  const handlePasswordResetSubmit = async (values: z.infer<ReturnType<typeof passwordResetSchema>>) => {
      if (!actionCode) return;
      setIsSubmitting(true);
      setError(null);
      try {
          await confirmPasswordReset(auth, actionCode, values.newPassword);
          setSuccess(true);
      } catch (e: any) {
          console.error(e);
          setError(dict.forgotPassword.expiredLinkError);
      } finally {
          setIsSubmitting(false);
      }
  }

  const renderContent = () => {
    if (loading || !dict) {
      return (
         <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{dict?.verifyEmail.verifyingTitle || 'Verification in progress...'}</p>
        </div>
      );
    }

    if (error) {
       return (
         <div className="flex flex-col items-center gap-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <MailWarning className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-2xl font-headline">{dict.verifyEmail.verificationErrorTitle}</CardTitle>
            <CardDescription>{error}</CardDescription>
            <Button onClick={() => router.push(`/${lang}/login`)} className="mt-4">
                {dict.verifyEmail.backToLogin}
            </Button>
        </div>
      );
    }

    if (mode === 'resetPassword') {
        const forgotPasswordDict = dict.forgotPassword;
        return (
            <div className="space-y-4">
                 <div className="text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">{forgotPasswordDict.resetTitle}</CardTitle>
                    <CardDescription>{forgotPasswordDict.resetDescription}</CardDescription>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePasswordResetSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>{dict.settings.security.newPasswordLabel}</Label>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>{dict.settings.security.confirmPasswordLabel}</Label>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {forgotPasswordDict.resetSubmitButton}
                        </Button>
                    </form>
                </Form>
            </div>
        )
    }

    return null; // Success state is handled by the AlertDialog
  };

  const getSuccessDialogContent = () => {
    if (mode === 'verifyEmail') {
      return {
        title: dict?.verifyEmail.verificationSuccessTitle,
        description: dict?.verifyEmail.verificationSuccessDescription,
        buttonText: dict?.verifyEmail.proceedToLoginButton,
      };
    }
    if (mode === 'resetPassword') {
      return {
        title: dict?.forgotPassword.resetSuccessTitle,
        description: dict?.forgotPassword.resetSuccessDescription,
        buttonText: dict?.verifyEmail.proceedToLoginButton,
      };
    }
    return { title: '', description: '', buttonText: '' };
  }

  const { title, description, buttonText } = getSuccessDialogContent();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="pt-6">
            {renderContent()}
        </CardContent>
      </Card>
      
      <AlertDialog open={success}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleProceedToLogin}>
                {buttonText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
