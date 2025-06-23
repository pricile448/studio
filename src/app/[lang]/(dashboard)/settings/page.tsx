
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppearanceForm } from '@/components/settings/appearance-form';

export default async function SettingsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{dict.settings.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{dict.settings.appearance.title}</CardTitle>
          <CardDescription>{dict.settings.appearance.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceForm dict={dict.settings.appearance} lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
