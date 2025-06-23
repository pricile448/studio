
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{dict.settings.title}</h1>
      <SettingsClient dict={dict} lang={lang} />
    </div>
  );
}
