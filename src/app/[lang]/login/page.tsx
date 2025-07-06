
import { Suspense } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { LoginClient } from '@/components/login/login-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

function LoginFallback() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                     <Skeleton className="h-7 w-24 mx-auto" />
                     <Skeleton className="h-4 w-48 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="grid gap-4">
                     <Skeleton className="h-10" />
                     <Skeleton className="h-10" />
                     <Skeleton className="h-10" />
                </CardContent>
            </Card>
        </div>
    )
}

export default async function LoginPage({ params }: { params: { lang: Locale }}) {
  const dict = await getDictionary(params.lang);
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient dict={dict} lang={params.lang} />
    </Suspense>
  );
}
