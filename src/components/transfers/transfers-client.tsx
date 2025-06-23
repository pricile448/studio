
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
import { AddBeneficiaryDialog } from './add-beneficiary-dialog';


type TransfersClientProps = {
  dict: Dictionary['transfers'];
  accountsDict: Dictionary['accounts'];
  accounts: { id: string; name: string; balance: number }[];
  recentTransfers: { id: string; date: string; description: string; amount: number }[];
  beneficiaries: { id: string; name: string; iban: string }[];
  lang: Locale;
};

export function TransfersClient({ dict, accountsDict, accounts, recentTransfers, beneficiaries, lang }: TransfersClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const getAccountName = (name: string) => {
    const key = name as keyof typeof accountsDict;
    return accountsDict[key] || name;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
        <AddBeneficiaryDialog dict={dict} />
      </div>
      <Separator />
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
                          {getAccountName(account.name)} - {formatCurrency(account.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="to">{dict.to}</Label>
                   <Select>
                    <SelectTrigger id="to">
                      <SelectValue placeholder={dict.selectBeneficiary} />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map(beneficiary => (
                        <SelectItem key={beneficiary.id} value={beneficiary.id}>
                           <div className="flex flex-col">
                            <span>{beneficiary.name}</span>
                            <span className="text-xs text-muted-foreground">{beneficiary.iban}</span>
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
