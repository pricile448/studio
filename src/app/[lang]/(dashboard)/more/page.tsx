
import { getDictionary, type Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';

export default async function PlaceholderPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <Banknote className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight font-headline">
          {dict.placeholders.title}
        </h3>
        <p className="text-sm text-muted-foreground">{dict.placeholders.description}</p>
      </div>
    </div>
  );
}
