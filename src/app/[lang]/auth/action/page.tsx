
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/context/auth-context';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailCheck, MailWarning, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthActionPage({ params: { lang } }: { params: { lang: Locale } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  
  const [dict, setDict] = useState<Dictionary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  useEffect(() => {
    if (!dict) return;

    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');
    const verifyDict = dict.verifyEmail;

    if (mode === 'verifyEmail' && actionCode) {
      handleVerifyEmail(actionCode, verifyDict);
    } else {
      setError(verifyDict.invalidAction);
      setLoading(false);
    }
  }, [searchParams, dict]);

  const handleVerifyEmail = async (actionCode: string, verifyDict: Dictionary['verifyEmail']) => {
    setLoading(true);
    setError(null);
    try {
      await applyActionCode(auth, actionCode);
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      setError(verifyDict.expiredLinkError);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProceedToLogin = async () => {
    await logout();
    router.push(`/${lang}/login`);
  };

  const renderContent = () => {
    if (loading || !dict) {
      return (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <CardTitle className="mt-4">{dict?.verifyEmail.verifyingTitle || 'Verification in progress...'}</CardTitle>
          <CardDescription>{dict?.verifyEmail.verifyingDescription || 'Please wait a moment.'}</CardDescription>
        </>
      );
    }

    if (error) {
       return (
        <>
          <MailWarning className="h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-2xl font-headline">{dict.verifyEmail.verificationErrorTitle}</CardTitle>
          <CardDescription>{error}</CardDescription>
          <Button onClick={() => router.push(`/${lang}/login`)} className="mt-4">
            {dict.verifyEmail.backToLogin}
          </Button>
        </>
      );
    }

    return null; // Success state is handled by the AlertDialog
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {renderContent()}
            </div>
        </CardHeader>
      </Card>
      
      <AlertDialog open={success}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dict?.verifyEmail.verificationSuccessTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dict?.verifyEmail.verificationSuccessDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleProceedToLogin}>
                {dict?.verifyEmail.proceedToLoginButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
