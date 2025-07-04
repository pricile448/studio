
import { Suspense, use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AuthActionClient } from '@/components/auth/action-client';
import { Loader2 } from 'lucide-react';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

function AuthActionFallback() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Vérification en cours...</p>
            </div>
        </div>
    )
}

// Reworked to use a standard async Server Component to avoid experimental `use(Promise)` issues with the build.
export default function AuthActionPage({ params }: { params: { lang: Locale }}) {
  const dict = use(getDictionary(params.lang));

  return (
    <Suspense fallback={<AuthActionFallback />}>
      <AuthActionClient dict={dict} lang={params.lang} />
    </Suspense>
  );
}
