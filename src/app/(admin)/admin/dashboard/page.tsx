'use client';

import { useEffect, useState } from 'react';
import { getFirebaseServices } from '@/lib/firebase/config';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShieldCheck, MessageSquare, Loader2, ShieldX, ShieldQuestion, UserPlus, FileCheck2 } from "lucide-react";
import type { UserProfile } from '@/lib/firebase/firestore';
import { getAdmins } from '@/lib/firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const { db } = getFirebaseServices('admin');

interface Stat {
    title: string;
    value: string | number;
    icon: React.ElementType;
    loading: boolean;
}

interface ActivityItem {
    id: string;
    type: 'user' | 'kyc';
    timestamp: Date;
    data: any;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Utilisateurs Totaux", value: 0, icon: Users, loading: true },
    { title: "Vérifications en attente", value: 0, icon: ShieldQuestion, loading: true },
    { title: "Vérifications approuvées", value: 0, icon: ShieldCheck, loading: true },
    { title: "Vérifications rejetées", value: 0, icon: ShieldX, loading: true },
    { title: "Tickets de support ouverts", value: 3, icon: MessageSquare, loading: false },
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setActivityLoading(true);
      try {
        // --- Fetch Stats ---
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const totalUsers = usersSnapshot.size;

        const kycCollection = collection(db, "kycSubmissions");
        const kycSnapshot = await getDocs(kycCollection);
        
        let pendingKyc = 0;
        let approvedKyc = 0;
        let rejectedKyc = 0;
        
        kycSnapshot.forEach(doc => {
            const status = doc.data().status;
            if (status === 'pending') pendingKyc++;
            else if (status === 'approved') approvedKyc++;
            else if (status === 'rejected') rejectedKyc++;
        });
        
        setStats(prevStats => [
            { ...prevStats[0], value: totalUsers, loading: false },
            { ...prevStats[1], value: pendingKyc, loading: false },
            { ...prevStats[2], value: approvedKyc, loading: false },
            { ...prevStats[3], value: rejectedKyc, loading: false },
            prevStats[4],
        ]);

        // --- Fetch Recent Activities ---
        const usersQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(3));
        const recentUsersSnapshot = await getDocs(usersQuery);
        const recentUsers = recentUsersSnapshot.docs.map(doc => ({ 
            type: 'user' as const, 
            id: doc.id,
            timestamp: doc.data().createdAt.toDate(),
            data: doc.data()
        }));

        const kycQuery = query(kycCollection, orderBy("submittedAt", "desc"), limit(3));
        const recentKycSnapshot = await getDocs(kycQuery);
        const recentKyc = recentKycSnapshot.docs.map(doc => ({ 
            type: 'kyc' as const, 
            id: doc.id,
            timestamp: doc.data().submittedAt.toDate(),
            data: doc.data()
        }));

        const combinedActivity = [...recentUsers, ...recentKyc]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5);
            
        setRecentActivity(combinedActivity);

        // --- Fetch Admins ---
        const adminList = await getAdmins(db);
        setAdmins(adminList);

      } catch (error) {
        console.error("Erreur lors de la récupération des données du tableau de bord:", error);
        setStats(prevStats => prevStats.map(stat => ({ ...stat, loading: false, value: 'Erreur' })));
      } finally {
        setActivityLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('') || '?';

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold font-headline shrink-0 mb-6">Tableau de bord Administrateur</h1>
      
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
            <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                {stat.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                )}
                </CardContent>
            </Card>
            );
        })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                    <CardDescription>Les dernières inscriptions et soumissions KYC.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activityLoading ? (
                        <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                     <Avatar className="h-9 w-9">
                                        <AvatarImage src={item.data.photoURL} alt={item.type === 'user' ? `${item.data.firstName} ${item.data.lastName}` : item.data.userName} />
                                        <AvatarFallback>{getInitials(item.type === 'user' ? `${item.data.firstName} ${item.data.lastName}` : item.data.userName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {item.type === 'user' ? `Nouvel utilisateur : ${item.data.firstName} ${item.data.lastName}` : `Nouvelle soumission KYC : ${item.data.userName}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-muted rounded-full">
                                        {item.type === 'user' ? <UserPlus className="h-4 w-4 text-muted-foreground" /> : <FileCheck2 className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center p-8">Aucune activité récente.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                 <CardHeader>
                    <CardTitle>Administrateurs</CardTitle>
                    <CardDescription>Liste des utilisateurs avec des privilèges d'administrateur.</CardDescription>
                </CardHeader>
                <CardContent>
                     {activityLoading ? (
                        <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : admins.length > 0 ? (
                        <div className="space-y-4">
                            {admins.map(admin => (
                                <div key={admin.uid} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={admin.photoURL} alt={`${admin.firstName} ${admin.lastName}`} />
                                        <AvatarFallback>{getInitials(`${admin.firstName} ${admin.lastName}`)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{admin.firstName} {admin.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center p-8">Aucun administrateur trouvé.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
