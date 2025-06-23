
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { HelpCircle, FileText, Globe, Gift } from 'lucide-react';

const moreOptions = [
    { key: 'help', icon: HelpCircle, href: '#' },
    { key: 'documents', icon: FileText, href: '#' },
    { key: 'exchange', icon: Globe, href: '#' },
    { key: 'referrals', icon: Gift, href: '#' },
]

export default async function MorePage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const moreDict = dict.more;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{moreDict.title}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {moreOptions.map((option) => {
            const Icon = option.icon;
            const key = option.key as keyof typeof moreDict;
            return (
                 <Link href={option.href} key={option.key}>
                    <Card className="hover:bg-accent/10 hover:border-primary transition-colors">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                            <Icon className="h-10 w-10 text-primary" />
                            <span className="text-lg font-semibold font-headline">{moreDict[key as keyof typeof moreDict]}</span>
                        </CardContent>
                    </Card>
                 </Link>
            )
        })}
      </div>
    </div>
  );
}
