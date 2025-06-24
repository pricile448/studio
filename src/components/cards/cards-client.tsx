
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Wifi, Snowflake, Pin, SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '@/components/ui/kyc-prompt';
import { Skeleton } from '../ui/skeleton';

export function CardsClient({ dict, lang }: { dict: Dictionary, lang: Locale }) {
  const { userProfile, loading } = useAuth();
  const [isFrozen, setIsFrozen] = useState(false);
  const [limit, setLimit] = useState(2000);
  const [newLimit, setNewLimit] = useState(limit);
  const [showPin, setShowPin] = useState(false);
  const { toast } = useToast();
  
  const cardsDict = dict.cards;
  const kycDict = dict.kyc;

  if (loading || !userProfile) {
    return (
       <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Separator />
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="lg:col-span-1 aspect-[85.6/53.98] rounded-xl" />
          <Skeleton className="lg:col-span-2 h-80" />
        </div>
       </div>
    )
  }

  if (userProfile.kycStatus !== 'verified') {
    return <KycPrompt 
      lang={lang} 
      title={cardsDict.unverified_title}
      description={cardsDict.unverified_description}
      buttonText={kycDict.unverified_button}
    />;
  }

  const handleToggleFreeze = () => {
    const newFrozenState = !isFrozen;
    setIsFrozen(newFrozenState);
    toast({
      title: newFrozenState ? cardsDict.cardFrozen : cardsDict.cardUnfrozen,
    });
  };

  const handleSetLimit = () => {
    setLimit(newLimit);
    toast({
      title: cardsDict.limitUpdated,
    });
  };

  const handleOrderCard = () => {
     toast({
      title: cardsDict.cardOrdered,
      description: cardsDict.cardOrderedDescription,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{cardsDict.title}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              {cardsDict.orderCard}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{cardsDict.orderCardTitle}</DialogTitle>
              <DialogDescription>{cardsDict.orderCardDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{cardsDict.cancelButton}</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleOrderCard}>{cardsDict.confirmOrder}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className={cn(
            "aspect-[85.6/53.98] bg-primary text-primary-foreground p-6 flex flex-col justify-between rounded-xl shadow-lg transition-all",
            isFrozen && "grayscale opacity-50"
          )}>
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
                  <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
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
                <Button variant="outline" size="icon" onClick={handleToggleFreeze}>
                    <Snowflake className={cn(isFrozen && "text-blue-500")}/>
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                        <div>
                        <h3 className="font-semibold">{cardsDict.setLimit}</h3>
                        <p className="text-sm text-muted-foreground">{cardsDict.setLimitDescription}</p>
                        </div>
                        <Button variant="outline" size="icon" className="pointer-events-none"><SlidersHorizontal /></Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{cardsDict.setLimitTitle}</DialogTitle>
                        <DialogDescription>{cardsDict.setLimitDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="current-limit">{cardsDict.currentLimit}</Label>
                        <Input id="current-limit" value={limit} readOnly disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-limit">{cardsDict.newLimitLabel}</Label>
                        <Input id="new-limit" type="number" value={newLimit} onChange={(e) => setNewLimit(Number(e.target.value))} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{cardsDict.cancelButton}</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button onClick={handleSetLimit}>{cardsDict.saveButton}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
               </Dialog>

               <Dialog onOpenChange={setShowPin.bind(null, false)}>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                        <div>
                        <h3 className="font-semibold">{cardsDict.viewPin}</h3>
                        <p className="text-sm text-muted-foreground">{cardsDict.viewPinDescription}</p>
                        </div>
                        <Button variant="outline" size="icon" className="pointer-events-none"><Pin /></Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{cardsDict.viewPinTitle}</DialogTitle>
                        <DialogDescription>{cardsDict.viewPinDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                        {showPin ? (
                             <span className="text-4xl font-bold font-mono tracking-widest">1234</span>
                        ) : (
                             <span className="text-4xl font-bold font-mono tracking-widest">****</span>
                        )}
                       
                    </div>
                     <DialogFooter className="sm:justify-between gap-2">
                        <Button variant="ghost" onClick={() => setShowPin(!showPin)} className="sm:mr-auto">
                            {showPin ? <EyeOff className="mr-2"/> : <Eye className="mr-2"/>}
                            {showPin ? cardsDict.hidePin : cardsDict.showPin}
                        </Button>
                        <DialogClose asChild>
                            <Button>{cardsDict.closeButton}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
               </Dialog>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
