import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { IbanClient } from '@/components/iban/iban-client';

export default async function IbanPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  const ibanDetails = {
    holder: '', // This will be replaced by userProfile data in the client component
    iban: '', // This will be replaced by userProfile data in the client component
    bic: '', // This will be replaced by userProfile data in the client component
    bankName: dict.cards.cardBankName,
    bankAddress: '8-12 Avenue de la Grande Armée, 75017 Paris',
    clientAddress: '', // This will be replaced by userProfile data in the client component
  }

  return (
     <div className="flex flex-col space-y-6">
       <h1 className="text-3xl font-bold font-headline">{dict.iban.title}</h1>
       <div className="flex flex-1 items-center justify-center">
            <IbanClient 
                dict={dict}
                lang={lang}
                details={ibanDetails}
            />
       </div>
    </div>
  );
}
