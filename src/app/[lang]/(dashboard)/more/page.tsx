import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { MoreClient } from '@/components/more/more-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function DocumentsPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <MoreClient dict={dict} lang={lang} />;
}
