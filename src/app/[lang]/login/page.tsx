
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { LoginClient } from '@/components/login/login-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoginLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default async function LoginPage({ params }: { params: { lang: Locale }}) {
  const dict = await getDictionary(params.lang);
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginClient dict={dict} lang={params.lang} />
    </Suspense>
  );
}
