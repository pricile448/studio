
'use client';

import { useEffect, useState } from 'react';
import { getAdminDashboardData, type AdminDashboardDataResult } from '@/ai/flows/get-admin-dashboard-data-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShieldCheck, MessageSquare, Loader2, ShieldX, ShieldQuestion, UserPlus, FileCheck2, AlertTriangle } from "lucide-react";
import type { UserProfile } from '@/lib/firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ActivityItem {
    id: string;
    type: 'user' | 'kyc';
    timestamp: Date; // Parsed from ISO string
    data: any;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState([
    { title: "Utilisateurs Totaux", value: 0, icon: Users, loading: true },
    { title: "Vérifications en attente", value: 0, icon: ShieldQuestion, loading: true },
    { title: "Vérifications approuvées", value: 0, icon: ShieldCheck, loading: true },
    { title: "Vérifications rejetées", value: 0, icon: ShieldX, loading: true },
    { title: "Tickets de support ouverts", value: 3, icon: MessageSquare, loading: false }, // Static for now
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setDashboardError(null);
      try {
        const result: AdminDashboardDataResult = await getAdminDashboardData();
        
        if (result.success && result.data) {
          const data = result.data;
          setStats(prevStats => [
              { ...prevStats[0], value: data.stats.totalUsers, loading: false },
              { ...prevStats[1], value: data.stats.pendingKyc, loading: false },
              { ...prevStats[2], value: data.stats.approvedKyc, loading: false },
              { ...prevStats[3], value: data.stats.rejectedKyc, loading: false },
              prevStats[4],
          ]);

          const parsedActivity = data.recentActivity.map(item => ({
              ...item,
              timestamp: new Date(item.timestamp),
          }));
          setRecentActivity(parsedActivity);
          setAdmins(data.admins as UserProfile[]);

        } else {
          console.error("Erreur lors de la récupération des données du tableau de bord:", result.error);
          setDashboardError(result.error || "Une erreur inconnue est survenue.");
        }

      } catch (error: any) {
        console.error("Erreur inattendue lors de la récupération des données:", error);
        setDashboardError(error.message || "Une erreur réseau ou inattendue est survenue.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('') || '?';

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (dashboardError) {
      return (
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement des données</AlertTitle>
              <AlertDescription>
                  <p>{dashboardError}</p>
                  <p className="mt-2">Veuillez consulter les instructions dans le fichier <strong>DEPLOYMENT.md</strong> à la racine de votre projet pour configurer l'accès à la base de données.</p>
              </AlertDescription>
          </Alert>
      );
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold font-headline shrink-0 mb-6">Tableau de bord Administrateur</h1>
      
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
                    {loading ? (
                        <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map(item => (
                                <div key={`${item.type}-${item.id}`} className="flex items-center gap-4">
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
                     {loading ? (
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

    