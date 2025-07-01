
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import { Separator } from '@/components/ui/separator';
import { PlusCircle, Wifi, Snowflake, Pin, SlidersHorizontal, Eye, EyeOff, Hourglass, CreditCard, Smartphone, Loader2, Info } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import type { VirtualCard, PhysicalCard, PhysicalCardType, UserProfile } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '@/components/ui/kyc-prompt';
import { KycPendingPrompt } from '@/components/ui/kyc-pending-prompt';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

function VirtualCardDisplay({ card, dict, userProfile }: { card: VirtualCard, dict: Dictionary['cards'], userProfile: UserProfile | null }) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="space-y-4">
            <div className={cn(
                "aspect-[85.6/53.98] bg-gradient-to-br from-gray-700 via-gray-900 to-black text-white p-4 sm:p-6 flex flex-col justify-between rounded-xl shadow-lg transition-all",
                card.isFrozen && "grayscale opacity-50"
            )}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{dict.virtualCard}</span>
                       {card.isFrozen && <Badge variant="destructive">Suspendue</Badge>}
                    </div>
                    <Wifi className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-center font-mono text-lg sm:text-xl tracking-widest text-center space-x-2 sm:space-x-4">
                        <span>{showDetails ? card.number.substring(0, 4) : '****'}</span>
                        <span>{showDetails ? card.number.substring(5, 9) : '****'}</span>
                        <span>{showDetails ? card.number.substring(10, 14) : '****'}</span>
                        <span>{card.number.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between items-end text-xs sm:text-sm uppercase">
                        <div className="w-2/3">
                            <p className="text-xs opacity-80">{dict.cardHolder}</p>
                            <p className="font-medium truncate">{userProfile?.firstName} {userProfile?.lastName}</p>
                        </div>
                        <div className="text-right w-1/3">
                            <p className="text-xs opacity-80">{dict.validThru}</p>
                            <p className="font-medium">{showDetails ? card.expiry : "**/**"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                 <div className="font-mono text-sm">
                    <span className="text-muted-foreground">CVV: </span>
                    <span className="font-semibold tracking-widest">{showDetails ? card.cvv : '***'}</span>
                 </div>
                 <Button variant="secondary" size="sm" onClick={() => setShowDetails(!showDetails)} disabled={card.isFrozen}>
                    {showDetails ? <EyeOff className="mr-2 h-4 w-4"/> : <Eye className="mr-2 h-4 w-4"/>}
                    {showDetails ? dict.hidePin : dict.showPin}
                 </Button>
            </div>
        </div>
    );
}


export function CardsClient({ dict, lang }: { dict: Dictionary, lang: Locale }) {
  const { userProfile, loading, requestCard, requestVirtualCard, updateUserProfileData } = useAuth();
  const [limit, setLimit] = useState(userProfile?.cardLimits?.monthly || 2000);
  const [newLimit, setNewLimit] = useState(limit);
  const [showPin, setShowPin] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const { toast } = useToast();
  
  const [showPhysicalInfo, setShowPhysicalInfo] = useState(false);
  const [showVirtualInfo, setShowVirtualInfo] = useState(false);
  const [isRequestingVirtual, setIsRequestingVirtual] = useState(false);

  // New states for interactive card
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTogglingFreeze, setIsTogglingFreeze] = useState(false);

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

  const handleToggleFreeze = async () => {
    if (!userProfile.physicalCard) return;
    setIsTogglingFreeze(true);
    const newStatus = userProfile.cardStatus === 'active' ? 'suspended' : 'active';
    try {
        await updateUserProfileData({ cardStatus: newStatus });
        toast({
            title: newStatus === 'suspended' ? cardsDict.cardFrozen : cardsDict.cardUnfrozen,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: (error as Error).message
        });
    } finally {
        setIsTogglingFreeze(false);
    }
  };

  const handleSetLimit = async () => {
    setLimit(newLimit);
     await updateUserProfileData({ cardLimits: { ...userProfile.cardLimits, monthly: newLimit } as any });
    toast({
      title: cardsDict.limitUpdated,
    });
  };

  const handleOrderPhysicalCard = async (cardType: PhysicalCardType) => {
     if (userProfile.cardStatus !== 'none') return;
     setIsOrdering(true);
     try {
       await requestCard(cardType);
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

  const handleRequestVirtualCard = async () => {
    setIsRequestingVirtual(true);
    try {
      await requestVirtualCard();
      setShowVirtualInfo(true);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Error",
        description: (error as Error).message
       })
    } finally {
       setIsRequestingVirtual(false);
    }
  };

  const cardStyleClasses = {
    essentielle: "from-blue-600 to-blue-800 text-white",
    precieuse: "from-amber-400 to-amber-600 text-black",
    luminax: "from-gray-800 to-black text-white"
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

    const physicalCard = userProfile.physicalCard;

    return (
      <div className="space-y-8">
        {/* Physical Card Section */}
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">{cardsDict.physicalCard}</h2>
          {userProfile.cardStatus === 'active' && physicalCard && (
             <div className="grid gap-8 lg:grid-cols-3">
              <div className="card-flip-container lg:col-span-1 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={cn("card-flipper relative w-full aspect-[85.6/53.98]", isFlipped && "is-flipped")}>
                      {/* Card Front */}
                      <div className={cn(
                          "card-front bg-gradient-to-br p-6 flex flex-col justify-between rounded-xl shadow-lg transition-all",
                          cardStyleClasses[physicalCard.type],
                          userProfile.cardStatus === 'suspended' && "grayscale opacity-50"
                      )}>
                          <div className="flex justify-between items-start">
                              <span className="font-semibold">{cardsDict.cardBankName}</span>
                              <Wifi className="h-6 w-6" />
                          </div>
                          <div className="space-y-2">
                              <div className="flex items-center gap-4 font-mono text-xl tracking-widest">
                                  <span>{physicalCard.number.substring(0, 4)}</span>
                                  <span>{physicalCard.number.substring(4, 8)}</span>
                                  <span>{physicalCard.number.substring(8, 12)}</span>
                                  <span>{physicalCard.number.substring(12, 16)}</span>
                              </div>
                              <div className="flex justify-between text-sm uppercase">
                                  <div>
                                      <p className="text-xs opacity-80">{cardsDict.cardHolder}</p>
                                      <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                                  </div>
                                  <div>
                                      <p className="text-xs opacity-80">{cardsDict.validThru}</p>
                                      <p className="font-medium">{physicalCard.expiry}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                      {/* Card Back */}
                       <div className={cn(
                          "card-back bg-gradient-to-br rounded-xl shadow-lg flex flex-col",
                          cardStyleClasses[physicalCard.type]
                      )}>
                          <div className="h-12 bg-black mt-8" aria-label={cardsDict.magneticStripe}></div>
                          <div className="bg-white text-black p-2 mx-6 mt-4 rounded-md text-right">
                              <span className="text-sm">CVV</span>
                              <span className="font-mono font-bold ml-2">{physicalCard.cvv}</span>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader><CardTitle className="font-headline">{dict.settings.tabs.security}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <Dialog onOpenChange={setShowPin.bind(null, false)}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={!physicalCard.isPinVisibleToUser || userProfile.cardStatus === 'suspended'}>
                                 <Pin className="mr-2" /> {cardsDict.viewPin}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>{cardsDict.viewPinTitle}</DialogTitle><DialogDescription>{cardsDict.viewPinDescription}</DialogDescription></DialogHeader>
                            <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                                {showPin ? (<span className="text-4xl font-bold font-mono tracking-widest">{physicalCard.pin}</span>) : (<span className="text-4xl font-bold font-mono tracking-widest">****</span>)}
                            </div>
                            <DialogFooter className="sm:justify-between gap-2">
                                <Button variant="ghost" onClick={() => setShowPin(!showPin)} className="sm:mr-auto">{showPin ? <EyeOff className="mr-2"/> : <Eye className="mr-2"/>}{showPin ? cardsDict.hidePin : cardsDict.showPin}</Button>
                                <DialogClose asChild><Button>{cardsDict.closeButton}</Button></DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                     <Button variant="outline" className="w-full" onClick={handleToggleFreeze} disabled={isTogglingFreeze}>
                      {isTogglingFreeze ? <Loader2 className="mr-2 animate-spin" /> : <Snowflake className="mr-2" />}
                      {userProfile.cardStatus === 'suspended' ? cardsDict.unfreeze : cardsDict.freeze}
                    </Button>
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
                <AlertTitle>{cardsDict.noPhysicalCard}</AlertTitle>
                <AlertDescription>{cardsDict.noPhysicalCardDescription}</AlertDescription>
              </Alert>
          )}
        </div>
        
        <Separator />

        {/* Virtual Cards Section */}
        <div>
          <h2 className="text-xl font-bold font-headline mb-4">{cardsDict.virtualCard}s</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(userProfile.virtualCards || []).map(card => (
              <VirtualCardDisplay key={card.id} card={card} dict={cardsDict} userProfile={userProfile} />
            ))}
            
            {userProfile.hasPendingVirtualCardRequest && (
              <Card className="col-span-full bg-muted/50 border-dashed">
                 <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
                  <Hourglass className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">{cardsDict.virtual_request_pending_title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{cardsDict.virtual_request_pending_description}</p>
                </CardContent>
              </Card>
            )}

            {(!userProfile.virtualCards || userProfile.virtualCards.length === 0) && !userProfile.hasPendingVirtualCardRequest && (
              <Card className="border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
                  <p className="text-muted-foreground mb-4">{cardsDict.noVirtualCards}</p>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="outline" disabled={isRequestingVirtual}>
                             {isRequestingVirtual ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2" />}
                              {cardsDict.generateVirtual}
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>{cardsDict.virtual_request_dialog_title}</AlertDialogTitle>
                              <AlertDialogDescription>{cardsDict.virtual_request_dialog_description}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={handleRequestVirtualCard}>Confirmer la demande</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
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
            <AlertDialogTitle>{cardsDict.requestSubmittedTitle}</AlertDialogTitle>
            <AlertDialogDescription>{cardsDict.requestSubmittedDescriptionPhysical}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={() => setShowPhysicalInfo(false)}>{dict.kyc.step6_button}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showVirtualInfo} onOpenChange={setShowVirtualInfo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{cardsDict.requestSubmittedTitle}</AlertDialogTitle>
            <AlertDialogDescription>{cardsDict.requestSubmittedDescriptionVirtual}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={() => setShowVirtualInfo(false)}>{dict.kyc.step6_button}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{cardsDict.title}</h1>
        {userProfile.kycStatus === 'verified' && (
            <div className="flex gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" disabled={userProfile.cardStatus !== 'none' || isOrdering}>
                             {isOrdering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2" />}
                            {cardsDict.orderPhysical}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{cardsDict.physicalCardTitle}</DialogTitle>
                            <DialogDescription>{cardsDict.physicalCardDescription}</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                            {(['essentielle', 'precieuse', 'luminax'] as const).map(type => (
                                <DialogClose asChild key={type}>
                                <div
                                    onClick={() => handleOrderPhysicalCard(type)}
                                    className="cursor-pointer hover:shadow-xl hover:border-primary transition-all group border rounded-lg"
                                >
                                    <div className={cn("aspect-[85.6/53.98] bg-gradient-to-br p-4 flex flex-col justify-between rounded-t-lg", cardStyleClasses[type])}>
                                      <span className="font-semibold text-lg">{cardsDict[type].title}</span>
                                      <p className="text-xs opacity-90">{cardsDict[type].description}</p>
                                    </div>
                                    <div className="p-4">
                                        <Button variant="link" className="p-0 w-full justify-start group-hover:underline">
                                            {cardsDict.selectCard} {cardsDict[type].title}
                                        </Button>
                                    </div>
                                </div>
                                </DialogClose>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )}
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
}
