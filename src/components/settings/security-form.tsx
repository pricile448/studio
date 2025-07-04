'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr, en, de, es, pt } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/dictionaries';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const locales: {[key: string]: typeof fr} = { fr, en, de, es, pt };

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              <div className="relative">
                <FormControl>
                  <Input type={showCurrentPassword ? 'text' : 'password'} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
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
              <div className="relative">
                <FormControl>
                  <Input type={showNewPassword ? 'text' : 'password'} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
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
              <div className="relative">
                <FormControl>
                  <Input type={showConfirmPassword ? 'text' : 'password'} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
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

const inactivitySchema = z.object({
  inactivityTimeout: z.string(),
});

type InactivityFormValues = z.infer<ReturnType<typeof inactivitySchema>>;

function InactivityTimeoutForm({ dict }: { dict: Dictionary['settings']['security'] }) {
    const { user, userProfile, updateUserProfileData } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<InactivityFormValues>({
        resolver: zodResolver(inactivitySchema),
        defaultValues: {
            inactivityTimeout: '5',
        },
    });

    useEffect(() => {
        if (userProfile?.inactivityTimeout !== undefined) {
            form.setValue('inactivityTimeout', String(userProfile.inactivityTimeout));
        }
    }, [userProfile, form]);
    
    const onSubmit = async (data: InactivityFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await updateUserProfileData({ inactivityTimeout: Number(data.inactivityTimeout) });
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
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
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
    const { userProfile } = useAuth();
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium">{dict.lastConnectionTitle}</h3>
                <p className="text-sm text-muted-foreground">
                    {dict.lastConnectionDescription}:{' '}
                    {userProfile?.lastSignInTime ? (
                        <span className="font-semibold">
                            {format(userProfile.lastSignInTime, 'PPPP p', { locale: locales[lang] || fr })}
                        </span>
                    ) : (
                        <span>{dict.lastConnectionNever}</span>
                    )}
                </p>
            </div>
            
            <Separator className="my-8" />
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
