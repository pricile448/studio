
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage({ params: { lang } }: { params: { lang: Locale } }) {
  const { user, loading, resendVerificationEmail, logout } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  useEffect(() => {
    if (loading) return;
    // If there's no user, they should be at the login page.
    if (!user) {
      router.replace(`/${lang}/login`);
    } 
    // If the user is somehow already verified, send them to the dashboard.
    else if (user.emailVerified) {
      router.replace(`/${lang}/dashboard`);
    }
  }, [user, loading, router, lang]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
        await resendVerificationEmail();
        toast({
            title: dict?.verifyEmail.emailSent || 'Email Sent!',
            description: dict?.verifyEmail.emailSentDescription || 'A new verification email has been sent to your address.',
        });
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    } finally {
        setIsResending(false);
    }
  }

  const handleLogout = async () => {
    await logout(lang);
  }

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
          <CardTitle className="mt-4 text-2xl font-headline">{verifyDict.title}</CardTitle>
          <CardDescription>
            {verifyDict.description.replace('{email}', user.email || '')}
            <br />
            {verifyDict.checkSpam}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={handleResendEmail} disabled={isResending}>
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {verifyDict.resendButton}
          </Button>
           <Button variant="link" asChild>
                <Link href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                   {verifyDict.backToLogin}
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
