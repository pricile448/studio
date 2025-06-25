
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';

export default async function NotFound({ params }: { params: { lang?: Locale } }) {
  const lang = params.lang ?? 'fr';
  const dict = await getDictionary(lang);
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">{dict.notFound.title}</h2>
        <p className="max-w-md text-muted-foreground">
          {dict.notFound.description}
        </p>
        <Button asChild className="mt-4">
          <Link href={`/${lang}`}>{dict.notFound.button}</Link>
        </Button>
      </div>
    </div>
  );
}
