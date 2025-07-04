
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAllKycSubmissions, updateUserInFirestore, type KycSubmission } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Hourglass } from 'lucide-react';
import { getFirebaseServices } from '@/lib/firebase/config';
import Link from 'next/link';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';


const { db: adminDb } = getFirebaseServices('admin');

function PendingTable({ submissions, onAction, actionInProgressId }: { submissions: KycSubmission[], onAction: (submission: KycSubmission, status: 'approved' | 'rejected') => void, actionInProgressId: string | null }) {
    if (submissions.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Aucune demande de vérification en attente.</p>;
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de soumission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {submissions.map(submission => (
                    <TableRow key={submission.uid}>
                        <TableCell>{submission.userName}</TableCell>
                        <TableCell>{submission.userEmail}</TableCell>
                        <TableCell>{format(submission.submittedAt, 'dd MMMM yyyy', { locale: fr })}</TableCell>
                        <TableCell className="text-right space-x-2">
                           {actionInProgressId === submission.uid ? (
                                <Button variant="outline" size="sm" disabled>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => onAction(submission, 'approved')}>
                                        <CheckCircle className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => onAction(submission, 'rejected')}>
                                        <XCircle className="h-5 w-5" />
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/users/${submission.uid}`}>Voir</Link>
                                    </Button>
                                </>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function HistoryTable({ submissions }: { submissions: KycSubmission[] }) {
    if (submissions.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Aucun historique de demande trouvé.</p>;
    }

    const getStatusBadge = (status: 'approved' | 'rejected' | 'pending') => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 border-green-200">Approuvée</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejetée</Badge>;
            default: return <Badge variant="secondary">En attente</Badge>;
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de soumission</TableHead>
                    <TableHead>Date de traitement</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {submissions.map(submission => (
                    <TableRow key={submission.uid}>
                        <TableCell>{submission.userName}</TableCell>
                        <TableCell>{submission.userEmail}</TableCell>
                        <TableCell>{format(submission.submittedAt, 'dd MMMM yyyy', { locale: fr })}</TableCell>
                        <TableCell>{submission.processedAt ? format(submission.processedAt, 'dd MMMM yyyy', { locale: fr }) : '-'}</TableCell>
                        <TableCell className="text-right">{getStatusBadge(submission.status)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function KycAdminClient() {
    const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const submissionList = await getAllKycSubmissions(adminDb);
            setSubmissions(submissionList);
        } catch (error) {
            console.error("Erreur lors de la récupération des demandes KYC:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les demandes KYC.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const { pendingSubmissions, approvedSubmissions, rejectedSubmissions } = useMemo(() => {
        return {
            pendingSubmissions: submissions.filter(s => s.status === 'pending'),
            approvedSubmissions: submissions.filter(s => s.status === 'approved'),
            rejectedSubmissions: submissions.filter(s => s.status === 'rejected')
        };
    }, [submissions]);

    const handleKycAction = async (submission: KycSubmission, status: 'approved' | 'rejected') => {
        setUpdatingId(submission.uid);
        try {
            const submissionRef = doc(adminDb, 'kycSubmissions', submission.uid);
            await updateDoc(submissionRef, { status, processedAt: serverTimestamp() });

            if (status === 'approved') {
                await updateUserInFirestore(submission.uid, { kycStatus: 'verified' }, adminDb);
                toast({ title: 'Utilisateur approuvé', description: `Le statut KYC de l'utilisateur a été mis à jour.` });
            } else { // 'rejected'
                toast({ variant: 'default', title: 'Demande rejetée', description: 'La soumission KYC a été marquée comme rejetée.' });
            }
            fetchSubmissions();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut KYC:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour du statut a échoué.' });
        } finally {
            setUpdatingId(null);
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demandes de Vérification d'Identité</CardTitle>
                <CardDescription>Examinez les demandes et consultez l'historique.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                    <TabsList className="h-auto flex-wrap gap-1">
                        <TabsTrigger value="pending"><Hourglass className="mr-2 h-4 w-4" />En attente <Badge className="ml-2">{pendingSubmissions.length}</Badge></TabsTrigger>
                        <TabsTrigger value="history_approved"><CheckCircle className="mr-2 h-4 w-4 text-green-600"/>Approuvées</TabsTrigger>
                        <TabsTrigger value="history_rejected"><XCircle className="mr-2 h-4 w-4 text-red-600"/>Rejetées</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending">
                        <PendingTable submissions={pendingSubmissions} onAction={handleKycAction} actionInProgressId={updatingId} />
                    </TabsContent>
                    <TabsContent value="history_approved">
                        <HistoryTable submissions={approvedSubmissions} />
                    </TabsContent>
                     <TabsContent value="history_rejected">
                        <HistoryTable submissions={rejectedSubmissions} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
