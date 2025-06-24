
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { IbanClient } from '@/components/iban/iban-client';

export default async function IbanPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  const ibanDetails = {
    holder: 'User Name',
    iban: 'FR76 3000 4000 0412 3456 7890 185',
    bic: 'BNPAFRPPXXX',
    bankName: dict.cards.cardBankName,
    bankAddress: '123 Banking Avenue, 75008 Paris, France',
    clientAddress: '123 Main St, 75001 Paris, France',
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
