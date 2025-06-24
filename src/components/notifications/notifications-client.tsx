
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Dictionary } from '@/lib/dictionaries';
import { BellRing, ShieldCheck } from 'lucide-react';

const mockNotifications = [
    {
        id: '1',
        icon: BellRing,
        title: 'Welcome to AmCbunq!',
        description: 'Your account has been successfully created. Explore our features now.',
        date: '2 hours ago',
        read: false,
    },
    {
        id: '2',
        icon: ShieldCheck,
        title: 'Profile Verification Required',
        description: 'Please complete your identity verification to unlock all features.',
        date: '1 day ago',
        read: false,
    },
];

export function NotificationsClient({ dict }: { dict: Dictionary }) {
    const notificationsDict = dict.dashboard.notifications;

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <h1 className="text-3xl font-bold font-headline">{notificationsDict.title}</h1>
         <Button variant="outline">
            {notificationsDict.markAllAsRead}
         </Button>
       </div>
      
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {mockNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <li key={notification.id} className="flex items-start gap-4 p-6 hover:bg-muted/50">
                    <div className="mt-1">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <p>{notification.date}</p>
                    </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
