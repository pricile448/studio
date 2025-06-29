
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/dictionaries';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const passwordFormSchema = (dict: Dictionary['settings']['security']) => z.object({
  currentPassword: z.string().min(1, { message: dict.passwordRequiredError }),
  newPassword: z.string().min(6, dict.passwordLengthError),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: dict.passwordMismatchError,
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<ReturnType<typeof passwordFormSchema>>;

function PasswordChangeForm({ dict }: { dict: Dictionary['settings']['security'] }) {
  const { user, updateUserPassword } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema(dict)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user || !user.email) return;

    setIsSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updateUserPassword(data.newPassword);

      toast({ title: dict.passwordUpdateSuccess });
      form.reset();
    } catch (error: any) {
      let description = dict.passwordUpdateError;
      if (error.code === 'auth/wrong-password') {
        description = dict.currentPasswordIncorrect;
      } else if (error.code === 'auth/requires-recent-login') {
        description = dict.reauthenticationRequired;
      }
      toast({ variant: 'destructive', title: dict.passwordUpdateErrorTitle, description });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.currentPasswordLabel}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.newPasswordLabel}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.confirmPasswordLabel}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {dict.saveButton}
        </Button>
      </form>
    </Form>
  );
}

const inactivitySchema = (dict: any) => z.object({
  inactivityTimeout: z.coerce.number(),
});

type InactivityFormValues = z.infer<ReturnType<typeof inactivitySchema>>;

function InactivityTimeoutForm({ dict }: { dict: Dictionary['settings']['security'] }) {
    const { user, userProfile, updateUserProfileData } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<InactivityFormValues>({
        resolver: zodResolver(inactivitySchema(dict)),
        defaultValues: {
            inactivityTimeout: 15,
        },
    });

    useEffect(() => {
        if (userProfile?.inactivityTimeout !== undefined) {
            form.setValue('inactivityTimeout', userProfile.inactivityTimeout);
        }
    }, [userProfile, form]);
    
    const onSubmit = async (data: InactivityFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await updateUserProfileData({ inactivityTimeout: data.inactivityTimeout });
            toast({ title: dict.saveSuccess });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                <FormField
                    control={form.control}
                    name="inactivityTimeout"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{dict.inactivityLabel}</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a timeout" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="5">{dict.minutes_5}</SelectItem>
                                    <SelectItem value="15">{dict.minutes_15}</SelectItem>
                                    <SelectItem value="30">{dict.minutes_30}</SelectItem>
                                    <SelectItem value="0">{dict.never}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {dict.saveTimeoutButton}
                </Button>
            </form>
        </Form>
    );
}

export function SecurityForm({ dict, lang }: { dict: Dictionary['settings']['security']; lang: string; }) {
    return (
        <div className="space-y-8">
            <PasswordChangeForm dict={dict} />
            <Separator className="my-8" />
            <div>
                <h3 className="text-lg font-medium">{dict.inactivityTitle}</h3>
                <p className="text-sm text-muted-foreground">{dict.inactivityDescription}</p>
            </div>
            <InactivityTimeoutForm dict={dict} />
        </div>
    )
}
