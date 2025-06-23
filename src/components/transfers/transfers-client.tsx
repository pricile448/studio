
'use client';

import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft } from 'lucide-react';


type TransfersClientProps = {
  dict: Dictionary['transfers'];
  accounts: { id: string; name: string; balance: number }[];
  recentTransfers: { id: string; date: string; description: string; amount: number }[];
  lang: Locale;
};

export function TransfersClient({ dict, accounts, recentTransfers, lang }: TransfersClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{dict.newTransfer}</CardTitle>
              <CardDescription>{dict.newTransferDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="from">{dict.from}</Label>
                  <Select>
                    <SelectTrigger id="from">
                      <SelectValue placeholder={dict.selectAccount} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name.charAt(0).toUpperCase() + account.name.slice(1)} - {formatCurrency(account.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="to">{dict.to}</Label>
                  <Input id="to" placeholder={dict.toPlaceholder} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{dict.amount}</Label>
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="description">{dict.description}</Label>
                <Textarea id="description" placeholder={dict.descriptionPlaceholder} />
              </div>
              <Button className="w-full md:w-auto">
                <ArrowRightLeft className="mr-2" />
                {dict.submit}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{dict.recentTransfers}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransfers.length > 0 ? (
                 <div className="space-y-4">
                    {recentTransfers.map((tx, index) => (
                    <div key={tx.id}>
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(tx.amount)}</p>
                        </div>
                        {index < recentTransfers.length - 1 && <Separator className="my-4" />}
                    </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{dict.noRecentTransfers}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
