
'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAllTransfers, updateTransferStatus, executeTransfer, type Transaction } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Hourglass, RefreshCw, History, PauseCircle, PlayCircle } from 'lucide-react';
import { getAdminDb } from '@/lib/firebase/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TransferWithUser = Transaction & { userId: string; userName: string };

function TransfersTable({ transfers, onAction, actionInProgressId }: { transfers: TransferWithUser[], onAction: (action: 'validate' | 'execute' | 'cancel' | 'pause' | 'resume', transfer: TransferWithUser) => void, actionInProgressId: string | null }) {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const actionButtons = (transfer: TransferWithUser) => {
        const isLoading = actionInProgressId === transfer.id;

        if (transfer.status === 'pending') {
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="outline" size="sm" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Valider</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Valider ce virement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Le virement passera au statut "En cours" et pourra être exécuté ou interrompu. Le solde du client ne sera pas encore débité.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onAction('validate', transfer)}>Valider</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }
        if (transfer.status === 'in_progress') {
            return (
                <div className="flex flex-wrap gap-2 justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="success" size="sm" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Exécuter</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Exécuter ce virement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Le solde du compte de l'utilisateur sera débité et le virement marqué comme complété.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onAction('execute', transfer)} variant="success">Confirmer l'exécution</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Interrompre</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Interrompre ce virement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                   Cette action est irréversible. Le virement sera marqué comme échoué et ne pourra plus être exécuté.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onAction('cancel', transfer)} variant="destructive">Confirmer l'interruption</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" size="sm" onClick={() => onAction('pause', transfer)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <PauseCircle className="mr-2 h-4 w-4" />} Mettre en pause
                    </Button>
                </div>
            )
        }
        if (transfer.status === 'in_review') {
            return (
                <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => onAction('resume', transfer)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <PlayCircle className="mr-2 h-4 w-4" />} Relancer
                    </Button>
                </div>
            )
        }
        return null;
    }

    if (transfers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>Aucun virement dans cette catégorie.</p>
            </div>
        )
    }

    return (
      <>
        {/* Desktop View */}
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Bénéficiaire</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date de demande</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                            <TableCell>
                                <div className="font-medium">{transfer.userName}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">{transfer.userId}</div>
                            </TableCell>
                            <TableCell>
                                 <div className="font-medium">{transfer.beneficiaryName}</div>
                                 <div className="text-sm text-muted-foreground">{transfer.description}</div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatCurrency(transfer.amount)}</TableCell>
                            <TableCell>{format(new Date(transfer.date), 'dd MMMM yyyy, HH:mm', { locale: fr })}</TableCell>
                            <TableCell className="text-right">{actionButtons(transfer)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden">
          <div className="space-y-4">
            {transfers.map(transfer => (
              <div key={transfer.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold">{transfer.userName}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{transfer.userId}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(transfer.amount)}</div>
                    <div className="text-xs text-muted-foreground">vers {transfer.beneficiaryName}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(transfer.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
                <div className="pt-3 border-t">
                  {actionButtons(transfer)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
}


function HistoryTable({ transfers }: { transfers: TransferWithUser[] }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const getStatusBadge = (status: 'completed' | 'failed') => {
        if (status === 'completed') {
            return <Badge className="bg-green-100 text-green-800 border-green-200">Terminé</Badge>;
        }
        return <Badge variant="destructive">Échoué</Badge>;
    };

    if (transfers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>Aucun virement dans l'historique.</p>
            </div>
        )
    }

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Bénéficiaire</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Statut Final</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transfers.map((transfer) => (
                            <TableRow key={transfer.id}>
                                <TableCell>
                                    <div className="font-medium">{transfer.userName}</div>
                                    <div className="text-sm text-muted-foreground">{transfer.userId}</div>
                                </TableCell>
                                <TableCell>
                                     <div className="font-medium">{transfer.beneficiaryName}</div>
                                     <div className="text-sm text-muted-foreground">{transfer.description}</div>
                                </TableCell>
                                <TableCell className="font-semibold">{formatCurrency(transfer.amount)}</TableCell>
                                <TableCell>{format(new Date(transfer.date), 'dd MMMM yyyy, HH:mm', { locale: fr })}</TableCell>
                                <TableCell className="text-right">{getStatusBadge(transfer.status as 'completed' | 'failed')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <div className="space-y-4">
                    {transfers.map(transfer => (
                        <div key={transfer.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <div className="font-semibold">{transfer.userName}</div>
                                    <div className="text-xs text-muted-foreground">vers {transfer.beneficiaryName}</div>
                                </div>
                                {getStatusBadge(transfer.status as 'completed' | 'failed')}
                            </div>
                             <div className="flex justify-between items-center text-sm pt-3 border-t">
                                <span className="text-muted-foreground">
                                    {format(new Date(transfer.date), "dd MMM yyyy", { locale: fr })}
                                </span>
                                <span className="font-semibold">{formatCurrency(transfer.amount)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}


export function TransfersAdminClient() {
    const [allTransfers, setAllTransfers] = useState<TransferWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
    const [isRefreshing, startRefreshTransition] = useTransition();
    const { toast } = useToast();

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const adminDb = getAdminDb();
            const transfersList = await getAllTransfers(adminDb);
            setAllTransfers(transfersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error("Erreur lors de la récupération des virements:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les virements.' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleRefresh = () => {
        startRefreshTransition(async () => {
            await fetchTransfers();
            toast({ title: 'Liste des virements actualisée.' });
        })
    }

    useEffect(() => {
        fetchTransfers();
    }, []);

    const handleAction = async (action: 'validate' | 'execute' | 'cancel' | 'pause' | 'resume', transfer: TransferWithUser) => {
        setActionInProgressId(transfer.id);
        try {
            const adminDb = getAdminDb();
            if (action === 'validate') {
                await updateTransferStatus(transfer.userId, transfer.id, 'in_progress', adminDb);
                toast({ title: 'Succès', description: 'Le virement a été validé et est prêt à être exécuté.' });
            } else if (action === 'execute') {
                await executeTransfer(transfer.userId, transfer.id, adminDb);
                toast({ title: 'Succès', description: 'Le virement a été exécuté et le solde du client a été mis à jour.' });
            } else if (action === 'cancel') {
                await updateTransferStatus(transfer.userId, transfer.id, 'failed', adminDb);
                toast({ variant: 'destructive', title: 'Action effectuée', description: 'Le virement a été interrompu.' });
            } else if (action === 'pause') {
                await updateTransferStatus(transfer.userId, transfer.id, 'in_review', adminDb);
                toast({ title: 'Succès', description: 'Le virement a été mis en pause pour examen.' });
            } else if (action === 'resume') {
                await updateTransferStatus(transfer.userId, transfer.id, 'in_progress', adminDb);
                toast({ title: 'Succès', description: 'Le virement a été relancé et est de nouveau en cours.' });
            }
            fetchTransfers();
        } catch (error) {
             toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
        } finally {
            setActionInProgressId(null);
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div></CardContent>
            </Card>
        );
    }
    
    const pendingTransfers = allTransfers.filter(t => t.status === 'pending');
    const inProgressTransfers = allTransfers.filter(t => t.status === 'in_progress');
    const inReviewTransfers = allTransfers.filter(t => t.status === 'in_review');
    const historicalTransfers = allTransfers.filter(t => t.status === 'completed' || t.status === 'failed');

    return (
       <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardDescription>Gérez les virements externes initiés par les utilisateurs.</CardDescription>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="w-full sm:w-auto">
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                        Actualiser
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="pending">
                    <TabsList className="h-auto flex-wrap gap-1">
                        <TabsTrigger value="pending">
                            <Hourglass className="mr-2 h-4 w-4" />
                            En attente
                            <Badge className="ml-2">{pendingTransfers.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="in_progress">
                             <CheckCircle className="mr-2 h-4 w-4 text-green-600"/>
                            En cours
                             <Badge className="ml-2">{inProgressTransfers.length}</Badge>
                        </TabsTrigger>
                         <TabsTrigger value="in_review">
                            <PauseCircle className="mr-2 h-4 w-4 text-orange-500" />
                            En examen
                             <Badge className="ml-2">{inReviewTransfers.length}</Badge>
                        </TabsTrigger>
                         <TabsTrigger value="history">
                            <History className="mr-2 h-4 w-4" />
                            Historique
                             <Badge className="ml-2">{historicalTransfers.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="pt-4">
                        <TransfersTable transfers={pendingTransfers} onAction={handleAction} actionInProgressId={actionInProgressId} />
                    </TabsContent>
                    <TabsContent value="in_progress" className="pt-4">
                        <TransfersTable transfers={inProgressTransfers} onAction={handleAction} actionInProgressId={actionInProgressId} />
                    </TabsContent>
                    <TabsContent value="in_review" className="pt-4">
                        <TransfersTable transfers={inReviewTransfers} onAction={handleAction} actionInProgressId={actionInProgressId} />
                    </TabsContent>
                    <TabsContent value="history" className="pt-4">
                        <HistoryTable transfers={historicalTransfers} />
                    </TabsContent>
                </Tabs>
            </CardContent>
       </Card>
    );
}
