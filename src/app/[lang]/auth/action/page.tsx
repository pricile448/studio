
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AuthActionClientContent } from './action-client-content';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

function AuthActionLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}


export default async function AuthActionPage({ params }: { params: { lang: Locale }}) {
  const dict = await getDictionary(params.lang);
  return (
    <Suspense fallback={<AuthActionLoading />}>
      <AuthActionClientContent dict={dict} lang={params.lang} />
    </Suspense>
  );
}
