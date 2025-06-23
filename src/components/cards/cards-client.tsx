
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
import type { Dictionary } from '@/lib/dictionaries';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CardsClient({ dict }: { dict: Dictionary['cards'] }) {
  const [isFrozen, setIsFrozen] = useState(false);
  const [limit, setLimit] = useState(2000);
  const [newLimit, setNewLimit] = useState(limit);
  const [showPin, setShowPin] = useState(false);
  const { toast } = useToast();

  const handleToggleFreeze = () => {
    const newFrozenState = !isFrozen;
    setIsFrozen(newFrozenState);
    toast({
      title: newFrozenState ? dict.cardFrozen : dict.cardUnfrozen,
    });
  };

  const handleSetLimit = () => {
    setLimit(newLimit);
    toast({
      title: dict.limitUpdated,
    });
  };

  const handleOrderCard = () => {
     toast({
      title: dict.cardOrdered,
      description: dict.cardOrderedDescription,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              {dict.orderCard}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dict.orderCardTitle}</DialogTitle>
              <DialogDescription>{dict.orderCardDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{dict.cancelButton}</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleOrderCard}>{dict.confirmOrder}</Button>
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
              <span className="font-semibold">{dict.cardBankName}</span>
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
                  <p className="text-xs text-primary-foreground/80">{dict.cardHolder}</p>
                  <p className="font-medium">User Name</p>
                </div>
                 <div>
                  <p className="text-xs text-primary-foreground/80">{dict.validThru}</p>
                  <p className="font-medium">12/28</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{dict.settings}</CardTitle>
              <CardDescription>{dict.settingsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-semibold">{dict.freeze}</h3>
                  <p className="text-sm text-muted-foreground">{dict.freezeDescription}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleToggleFreeze}>
                    <Snowflake className={cn(isFrozen && "text-blue-500")}/>
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                        <div>
                        <h3 className="font-semibold">{dict.setLimit}</h3>
                        <p className="text-sm text-muted-foreground">{dict.setLimitDescription}</p>
                        </div>
                        <Button variant="outline" size="icon" className="pointer-events-none"><SlidersHorizontal /></Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dict.setLimitTitle}</DialogTitle>
                        <DialogDescription>{dict.setLimitDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="current-limit">{dict.currentLimit}</Label>
                        <Input id="current-limit" value={limit} readOnly disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-limit">{dict.newLimitLabel}</Label>
                        <Input id="new-limit" type="number" value={newLimit} onChange={(e) => setNewLimit(Number(e.target.value))} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{dict.cancelButton}</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button onClick={handleSetLimit}>{dict.saveButton}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
               </Dialog>

               <Dialog onOpenChange={setShowPin.bind(null, false)}>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                        <div>
                        <h3 className="font-semibold">{dict.viewPin}</h3>
                        <p className="text-sm text-muted-foreground">{dict.viewPinDescription}</p>
                        </div>
                        <Button variant="outline" size="icon" className="pointer-events-none"><Pin /></Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dict.viewPinTitle}</DialogTitle>
                        <DialogDescription>{dict.viewPinDescription}</DialogDescription>
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
                            {showPin ? dict.hidePin : dict.showPin}
                        </Button>
                        <DialogClose asChild>
                            <Button>{dict.closeButton}</Button>
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
