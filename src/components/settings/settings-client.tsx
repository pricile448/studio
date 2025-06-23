
'use client';

import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppearanceForm } from '@/components/settings/appearance-form';
import { User, Lock, Bell, Paintbrush } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SettingsClientProps = {
  dict: Dictionary;
  lang: Locale;
};

export function SettingsClient({ dict, lang }: SettingsClientProps) {
  const settingsDict = dict.settings;
  const placeholdersDict = dict.placeholders;

  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
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
            <CardTitle className="font-headline">{settingsDict.tabs.profile}</CardTitle>
            <CardDescription>{placeholdersDict.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{placeholdersDict.title}</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{settingsDict.tabs.security}</CardTitle>
            <CardDescription>{placeholdersDict.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{placeholdersDict.title}</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{settingsDict.tabs.notifications}</CardTitle>
            <CardDescription>{placeholdersDict.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{placeholdersDict.title}</p>
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
