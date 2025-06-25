
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
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
import { MailWarning, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface AuthActionClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function AuthActionClient({ dict, lang }: AuthActionClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


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
  
  const handleProceedToLogin = () => {
    logout(); 
    router.push(`/${lang}/login`);
  };

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

    return null; // Success state is handled by the AlertDialog
  };

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
