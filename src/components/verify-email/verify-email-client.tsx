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
import { Input } from '@/components/ui/input';

interface VerifyEmailClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function VerifyEmailClient({ dict, lang }: VerifyEmailClientProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (user?.isEmailVerified) {
      setShowSuccessDialog(true);
    }
  }, [user]);

  const handleResendCode = async () => {
    if (!user?.email) return;
    setIsResending(true);

    try {
      const res = await fetch('/api/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const result = await res.json();
      if (result.success) {
        toast({
          title: dict?.verifyEmail.emailSent || 'Code envoyé',
          description: dict?.verifyEmail.emailSentDescription || 'Un nouveau code a été envoyé à votre adresse e-mail.',
        });
      } else {
        throw new Error(result.message || 'Erreur lors de l’envoi du code');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user?.email || !code) return;
    setIsVerifying(true);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code }),
      });

      const result = await res.json();
      if (result.success) {
        toast({ title: 'Succès', description: 'Votre e-mail a été vérifié.' });
        setShowSuccessDialog(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.message || 'Code invalide ou expiré.',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedToDashboard = () => {
    router.push(`/${lang}/dashboard`);
  };

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
          <Input
            placeholder="Code à 6 chiffres"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleVerifyCode} disabled={isVerifying || !code}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vérifier le code
          </Button>

          <p className="text-sm text-muted-foreground">
            {verifyDict.noCodePrompt}{' '}
            <Button variant="link" onClick={handleResendCode} disabled={isResending} className="p-0 h-auto">
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
