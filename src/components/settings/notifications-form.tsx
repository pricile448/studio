
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import type { Dictionary } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUserInFirestore } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';

interface NotificationsFormProps {
  dict: Dictionary['settings']['notifications'];
}

const notificationsSchema = z.object({
  email: z.boolean(),
  promotions: z.boolean(),
  security: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsSchema>;

export function NotificationsForm({ dict }: NotificationsFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email: true,
      promotions: false,
      security: true,
    },
  });
  
  useEffect(() => {
    if (userProfile?.notificationPrefs) {
      form.reset(userProfile.notificationPrefs);
    }
  }, [userProfile, form]);

  const onSubmit = async (data: NotificationsFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateUserInFirestore(user.uid, { notificationPrefs: data });
      toast({ title: dict.saveSuccess });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{dict.email.title}</FormLabel>
                  <FormDescription>{dict.email.description}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promotions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{dict.promotions.title}</FormLabel>
                  <FormDescription>{dict.promotions.description}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="security"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{dict.security.title}</FormLabel>
                  <FormDescription>{dict.security.description}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
           {dict.saveButton}
        </Button>
      </form>
    </Form>
  );
}
