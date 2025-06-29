'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, type UserProfile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import Link from 'next/link';
import { getFirebaseServices } from '@/lib/firebase/config';

const { db: adminDb } = getFirebaseServices('admin');

export function UsersClient() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userList = await getAllUsers(adminDb);
                setUsers(userList);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getKycStatusVariant = (status: UserProfile['kycStatus']) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/60';
            case 'pending':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/60';
            case 'unverified':
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/60';
        }
    }

    const translateKycStatus = (status: UserProfile['kycStatus']) => {
         switch (status) {
            case 'verified': return 'Vérifié';
            case 'pending': return 'En attente';
            case 'unverified': default: return 'Non vérifié';
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Liste des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Statut KYC</TableHead>
                            <TableHead>Date d'inscription</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("border", getKycStatusVariant(user.kycStatus))}>
                                        {translateKycStatus(user.kycStatus)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/users/${user.uid}`}>Gérer</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
