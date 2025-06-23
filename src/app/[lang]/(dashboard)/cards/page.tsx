
import { getDictionary, type Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Wifi, Snowflake, Pin, SlidersHorizontal } from 'lucide-react';

export default async function CardsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const cardsDict = dict.cards;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{cardsDict.title}</h1>
        <Button>
          <PlusCircle className="mr-2" />
          {cardsDict.orderCard}
        </Button>
      </div>
      <Separator />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {/* Visual Card Component */}
          <Card className="aspect-[85.6/53.98] bg-primary text-primary-foreground p-6 flex flex-col justify-between rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <span className="font-semibold">{cardsDict.cardBankName}</span>
              <Wifi className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4 font-mono text-xl tracking-widest">
                <span>4000</span>
                <span>1234</span>
                <span>5678</span>
                <span>9010</span>
              </div>
              <div className="flex justify-between text-sm uppercase">
                <div>
                  <p className="text-xs text-primary-foreground/80">{cardsDict.cardHolder}</p>
                  <p className="font-medium">User Name</p>
                </div>
                 <div>
                  <p className="text-xs text-primary-foreground/80">{cardsDict.validThru}</p>
                  <p className="font-medium">12/28</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{cardsDict.settings}</CardTitle>
              <CardDescription>{cardsDict.settingsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-semibold">{cardsDict.freeze}</h3>
                  <p className="text-sm text-muted-foreground">{cardsDict.freezeDescription}</p>
                </div>
                <Button variant="outline" size="icon"><Snowflake /></Button>
              </div>
               <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-semibold">{cardsDict.setLimit}</h3>
                  <p className="text-sm text-muted-foreground">{cardsDict.setLimitDescription}</p>
                </div>
                <Button variant="outline" size="icon"><SlidersHorizontal /></Button>
              </div>
               <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-semibold">{cardsDict.viewPin}</h3>
                  <p className="text-sm text-muted-foreground">{cardsDict.viewPinDescription}</p>
                </div>
                <Button variant="outline" size="icon"><Pin /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
