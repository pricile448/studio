
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Separator } from '@/components/ui/separator';
import { PlusCircle, Wifi, Snowflake, Pin, SlidersHorizontal, Eye, EyeOff, Hourglass, CreditCard, Smartphone, Loader2, Info } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import type { VirtualCard } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '@/components/ui/kyc-prompt';
import { KycPendingPrompt } from '@/components/ui/kyc-pending-prompt';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

function VirtualCardDisplay({ card, dict }: { card: VirtualCard, dict: Dictionary['cards'] }) {
    const [showDetails, setShowDetails] = useState(false);
    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="text-lg">{card.name}</CardTitle>
                <CardDescription>
                    {dict.limit}: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(card.limit)}
                </CardDescription>
            </CardHeader>
            <CardContent className="font-mono space-y-2">
                <div>
                    <Label className="text-xs">{dict.cardHolder}</Label>
                    <p className="tracking-widest">{showDetails ? card.number : "**** **** **** " + card.number.slice(-4)}</p>
                </div>
                <div className="flex gap-4">
                    <div>
                        <Label className="text-xs">{dict.validThru}</Label>
                        <p>{showDetails ? card.expiry : "**/**"}</p>
                    </div>
                     <div>
                        <Label className="text-xs">CVV</Label>
                        <p>{showDetails ? card.cvv : "***"}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="secondary" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? <EyeOff className="mr-2"/> : <Eye className="mr-2"/>}
                    {showDetails ? dict.hidePin : dict.showPin}
                 </Button>
            </CardFooter>
        </Card>
    );
}


export function CardsClient({ dict, lang }: { dict: Dictionary, lang: Locale }) {
  const { userProfile, loading, requestCard, generateVirtualCard } = useAuth();
  const [isFrozen, setIsFrozen] = useState(false);
  const [limit, setLimit] = useState(2000);
  const [newLimit, setNewLimit] = useState(limit);
  const [showPin, setShowPin] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const { toast } = useToast();
  
  const [showPhysicalInfo, setShowPhysicalInfo] = useState(false);
  const [showVirtualInfo, setShowVirtualInfo] = useState(false);

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

  const handleOrderPhysicalCard = async () => {
     if (userProfile.cardStatus !== 'none') return;
     setIsOrdering(true);
     try {
       await requestCard();
       setShowPhysicalInfo(true);
     } catch (error) {
       console.error(error);
       toast({
        variant: 'destructive',
        title: "Error",
        description: (error as Error).message
       })
     } finally {
        setIsOrdering(false);
     }
  }

  const handleGenerateVirtualCard = async () => {
    setIsOrdering(true);
    try {
        await generateVirtualCard();
        setShowVirtualInfo(true);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: "Error",
            description: (error as Error).message
        });
    } finally {
        setIsOrdering(false);
    }
  };

  const renderContent = () => {
    if (userProfile.kycStatus === 'pending') {
      return <KycPendingPrompt 
        lang={lang} 
        title={kycDict.pending_title}
        description={kycDict.pending_description}
        buttonText={kycDict.step6_button}
      />;
    }
  
    if (userProfile.kycStatus !== 'verified') {
      return <KycPrompt 
        lang={lang} 
        title={cardsDict.unverified_title}
        description={cardsDict.unverified_description}
        buttonText={kycDict.unverified_button}
      />;
    }

    return (
      <div className="space-y-8">
        {/* Physical Card Section */}
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">{cardsDict.physicalCard}</h2>
          {userProfile.cardStatus === 'active' && (
             <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card className={cn(
                  "aspect-[85.6/53.98] bg-gradient-to-r from-primary to-primary-gradient-end text-primary-foreground p-6 flex flex-col justify-between rounded-xl shadow-lg transition-all",
                  isFrozen && "grayscale opacity-50"
                )}>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">{cardsDict.cardBankName}</span>
                    <Wifi className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 font-mono text-xl tracking-widest">
                      <span>4000</span><span>1234</span><span>5678</span><span>9010</span>
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
                  <CardHeader><CardTitle className="font-headline">{dict.settings.tabs.security}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div><h3 className="font-semibold">{cardsDict.freeze}</h3><p className="text-sm text-muted-foreground">{cardsDict.freezeDescription}</p></div>
                      <Button variant="outline" size="icon" onClick={handleToggleFreeze}><Snowflake className={cn(isFrozen && "text-blue-500")}/></Button>
                    </div>
                     <Dialog><DialogTrigger asChild><div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50"><div><h3 className="font-semibold">{cardsDict.setLimit}</h3><p className="text-sm text-muted-foreground">{cardsDict.setLimitDescription}</p></div><Button variant="outline" size="icon" className="pointer-events-none"><SlidersHorizontal /></Button></div></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{cardsDict.setLimitTitle}</DialogTitle><DialogDescription>{cardsDict.setLimitDescription}</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="current-limit">{cardsDict.currentLimit}</Label><Input id="current-limit" value={limit} readOnly disabled /></div><div className="space-y-2"><Label htmlFor="new-limit">{cardsDict.newLimitLabel}</Label><Input id="new-limit" type="number" value={newLimit} onChange={(e) => setNewLimit(Number(e.target.value))} /></div><DialogFooter><DialogClose asChild><Button variant="outline">{cardsDict.cancelButton}</Button></DialogClose><DialogClose asChild><Button onClick={handleSetLimit}>{cardsDict.saveButton}</Button></DialogClose></DialogFooter></DialogContent></Dialog>
                    <Dialog onOpenChange={setShowPin.bind(null, false)}><DialogTrigger asChild><div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50"><div><h3 className="font-semibold">{cardsDict.viewPin}</h3><p className="text-sm text-muted-foreground">{cardsDict.viewPinDescription}</p></div><Button variant="outline" size="icon" className="pointer-events-none"><Pin /></Button></div></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{cardsDict.viewPinTitle}</DialogTitle><DialogDescription>{cardsDict.viewPinDescription}</DialogDescription></DialogHeader><div className="flex items-center justify-center p-8 bg-muted rounded-lg">{showPin ? (<span className="text-4xl font-bold font-mono tracking-widest">1234</span>) : (<span className="text-4xl font-bold font-mono tracking-widest">****</span>)}</div><DialogFooter className="sm:justify-between gap-2"><Button variant="ghost" onClick={() => setShowPin(!showPin)} className="sm:mr-auto">{showPin ? <EyeOff className="mr-2"/> : <Eye className="mr-2"/>}{showPin ? cardsDict.hidePin : cardsDict.showPin}</Button><DialogClose asChild><Button>{cardsDict.closeButton}</Button></DialogClose></DialogFooter></DialogContent></Dialog>
                  </CardContent>
                </Card>
              </div>
             </div>
          )}
          {userProfile.cardStatus === 'requested' && (
             <Alert>
                <Hourglass className="h-4 w-4" />
                <AlertTitle>{cardsDict.request_pending_title}</AlertTitle>
                <AlertDescription>{cardsDict.request_pending_description}</AlertDescription>
              </Alert>
          )}
          {userProfile.cardStatus === 'none' && (
             <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertTitle>Aucune carte physique</AlertTitle>
                <AlertDescription>Vous n'avez pas encore de carte physique. Vous pouvez en commander une via le bouton "Commander une carte".</AlertDescription>
              </Alert>
          )}
        </div>
        
        <Separator />

        {/* Virtual Cards Section */}
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">{cardsDict.virtualCard}s</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(userProfile.virtualCards || []).map(card => <VirtualCardDisplay key={card.id} card={card} dict={cardsDict} />)}
            {(!userProfile.virtualCards || userProfile.virtualCards.length === 0) && (
              <p className="text-muted-foreground col-span-full">{cardsDict.noVirtualCards}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={showPhysicalInfo} onOpenChange={setShowPhysicalInfo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demande de carte physique enregistrée</AlertDialogTitle>
            <AlertDialogDescription>Votre demande a bien été prise en compte. Votre carte physique vous sera envoyée à votre adresse enregistrée et prendra plus de temps à arriver. Vous serez notifié de son expédition.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={() => setShowPhysicalInfo(false)}>Compris</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showVirtualInfo} onOpenChange={setShowVirtualInfo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Carte virtuelle générée !</AlertDialogTitle>
            <AlertDialogDescription>Votre nouvelle carte virtuelle est maintenant disponible et prête à être utilisée pour vos achats en ligne.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={() => setShowVirtualInfo(false)}>Compris</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{cardsDict.title}</h1>
        {userProfile.kycStatus === 'verified' && (
            <Dialog>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2" />{cardsDict.orderCard}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader><DialogTitle>{cardsDict.chooseCardType}</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CreditCard className="h-8 w-8 mb-2 text-primary" />
                                <CardTitle>{cardsDict.physicalCard}</CardTitle>
                                <CardDescription>{cardsDict.physicalCardDescription}</CardDescription>
                                {userProfile.cardStatus !== 'none' && (
                                   <Alert variant="info" className="text-xs mt-2">
                                     <Info className="h-4 w-4" />
                                     <AlertDescription>Une demande est déjà en cours ou une carte est déjà active.</AlertDescription>
                                   </Alert>
                                )}
                            </CardHeader>
                             <CardFooter className="mt-auto">
                                <DialogClose asChild>
                                    <Button onClick={handleOrderPhysicalCard} className="w-full" disabled={isOrdering || userProfile.cardStatus !== 'none'}>
                                        {isOrdering ? <Loader2 className="mr-2 animate-spin"/> : null}
                                        {cardsDict.orderPhysical}
                                    </Button>
                                </DialogClose>
                            </CardFooter>
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader>
                                <Smartphone className="h-8 w-8 mb-2 text-primary" />
                                <CardTitle>{cardsDict.virtualCard}</CardTitle>
                                <CardDescription>{cardsDict.virtualCardDescription}</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                <DialogClose asChild>
                                    <Button onClick={handleGenerateVirtualCard} className="w-full" disabled={isOrdering}>
                                        {isOrdering ? <Loader2 className="mr-2 animate-spin"/> : null}
                                        {cardsDict.generateVirtual}
                                    </Button>
                                </DialogClose>
                            </CardFooter>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>
        )}
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
}
