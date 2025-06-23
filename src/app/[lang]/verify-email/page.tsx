
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyEmailPage() {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] as Locale;
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
    // If there's no user, or the user is already verified, redirect.
    if (!user) {
      router.replace(`/${lang}/login`);
    } else if (user.emailVerified) {
      router.replace(`/${lang}/dashboard`);
    }
  }, [user, loading, router, lang]);
  
  // Periodically check if the email has been verified
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          toast({
            title: dict?.verifyEmail.verificationSuccess || "Success!",
            description: dict?.verifyEmail.verificationSuccessDescription || "Your email has been verified. Redirecting...",
            className: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
          });
          router.push(`/${lang}/dashboard`);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, router, lang, toast, dict]);


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
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={handleResendEmail} disabled={isResending}>
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {verifyDict.resendButton}
          </Button>
           <Button variant="link" asChild>
                <Link href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                   {verifyDict.backToLogin}
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
