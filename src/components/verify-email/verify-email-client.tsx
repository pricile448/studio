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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { applyActionCode, sendEmailVerification, reload } from 'firebase/auth';

interface VerifyEmailClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function VerifyEmailClient({ dict, lang }: VerifyEmailClientProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      if (user && !user.emailVerified) {
        // This effect can be used to automatically detect verification
        // or to handle action codes from URL if needed.
        // For now, we rely on the user manually clicking the link in their email.
      } else if (user && user.emailVerified) {
        setShowSuccessDialog(true);
      }
    };
    handleVerification();
  }, [user]);

  const handleResendEmail = async () => {
    if (!user) return;
    setIsResending(true);
    try {
        await sendEmailVerification(user);
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

  const handleProceedToDashboard = async () => {
    if (!user) return;
    await reload(user); // Ensure auth state is fresh
    router.push(`/${lang}/dashboard`);
  }

  if (loading || !dict) {
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
          <CardTitle className="mt-4 text-2xl font-headline">{verifyDict.title}</CardTitle>
          <CardDescription>
            {verifyDict.description.replace('{email}', user?.email || '')}
            <br />
            {verifyDict.checkSpam}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {verifyDict.noCodePrompt}{' '}
            <Button variant="link" onClick={handleResendEmail} disabled={isResending} className="p-0 h-auto">
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {verifyDict.resendButton}
            </Button>
          </p>
          <Button variant="outline" onClick={() => logout().then(() => router.push(`/${lang}/login`))}>
            {verifyDict.backToLogin}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{verifyDict.verificationSuccessTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {verifyDict.verificationSuccessDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleProceedToDashboard}>
              {dict.dashboard.title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
