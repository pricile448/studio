
'use client';

import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppearanceForm } from '@/components/settings/appearance-form';
import { User, Lock, Bell, Paintbrush } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './profile-form';
import { SecurityForm } from './security-form';
import { NotificationsForm } from './notifications-form';

type SettingsClientProps = {
  dict: Dictionary;
  lang: Locale;
};

export function SettingsClient({ dict, lang }: SettingsClientProps) {
  const settingsDict = dict.settings;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="h-auto flex-wrap gap-1">
        <TabsTrigger value="profile">
          <User className="mr-2 h-4 w-4" />
          {settingsDict.tabs.profile}
        </TabsTrigger>
        <TabsTrigger value="security">
          <Lock className="mr-2 h-4 w-4" />
          {settingsDict.tabs.security}
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="mr-2 h-4 w-4" />
          {settingsDict.tabs.notifications}
        </TabsTrigger>
        <TabsTrigger value="appearance">
          <Paintbrush className="mr-2 h-4 w-4" />
          {settingsDict.tabs.appearance}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{settingsDict.profile.title}</CardTitle>
            <CardDescription>{settingsDict.profile.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm dict={settingsDict.profile} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{settingsDict.security.title}</CardTitle>
            <CardDescription>{settingsDict.security.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <SecurityForm dict={settingsDict.security} lang={lang} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{settingsDict.notifications.title}</CardTitle>
            <CardDescription>{settingsDict.notifications.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationsForm dict={settingsDict.notifications} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{settingsDict.appearance.title}</CardTitle>
            <CardDescription>{settingsDict.appearance.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceForm dict={settingsDict.appearance} lang={lang} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
