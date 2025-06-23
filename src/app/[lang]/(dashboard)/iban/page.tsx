
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import { IbanClient } from '@/components/iban/iban-client';

export default async function IbanPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict: Dictionary = lang === 'fr' ? fr : en;
  
  const ibanDetails = {
    holder: 'User Name',
    iban: 'FR76 3000 4000 0412 3456 7890 185',
    bic: 'BNPAFRPPXXX',
  }

  return <IbanClient dict={dict.iban} details={ibanDetails} />;
}
