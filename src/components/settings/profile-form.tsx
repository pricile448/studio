
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Camera } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

interface ProfileFormProps {
  dict: Dictionary['settings']['profile'];
}

// The schema still needs to contain all fields for form validation.
// We will filter out readonly fields before submitting.
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email(),
  phone: z.string().min(1, 'Phone number is required'),
  dob: z.coerce.date({ required_error: 'A date of birth is required.' }),
  address: z.string().min(1, 'Street address is required.'),
  city: z.string().min(1, 'City is required.'),
  postalCode: z.string().min(1, 'Postal code is required.'),
  residenceCountry: z.string().min(1, 'Country of residence is required.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ dict }: ProfileFormProps) {
  const { user, userProfile, updateUserProfileData, updateAvatar } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      residenceCountry: '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        dob: userProfile.dob,
        address: userProfile.address,
        city: userProfile.city,
        postalCode: userProfile.postalCode,
        residenceCountry: userProfile.residenceCountry,
      });
    }
  }, [userProfile, form]);
  
  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      // Exclude readonly fields from the data sent for update.
      const { email, firstName, lastName, dob, phone, residenceCountry, ...updateData } = data;
      await updateUserProfileData(updateData);
      toast({ title: dict.saveSuccess });
    } catch (error) {
      toast({ variant: 'destructive', title: dict.updateError, description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        variant: 'destructive',
        title: dict.uploadErrorTitle,
        description: dict.fileTooLargeError,
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
        await updateAvatar(file);
        toast({
            title: dict.avatarUpdateSuccess,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: dict.uploadErrorTitle,
            description: (error as Error).message || 'An unknown error occurred.',
        });
    } finally {
        setIsUploadingAvatar(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  if (!userProfile || !user) {
    return (
      <div className="space-y-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      </div>
    )
  }
  
  const initials = userProfile ? `${userProfile.firstName?.charAt(0) ?? ''}${userProfile.lastName?.charAt(0) ?? ''}`.toUpperCase() : '';

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <button
          type="button"
          className="relative group rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
        >
          <Avatar className="h-24 w-24 text-3xl">
            <AvatarImage src={user.photoURL ?? ''} alt={userProfile.firstName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploadingAvatar ? (
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </div>
        </button>
        <div className="text-center">
            <p className="font-medium">{dict.uploadAvatarTitle}</p>
            <p className="text-sm text-muted-foreground">{dict.uploadAvatarDescription}</p>
        </div>
      </div>
      <Separator className="my-6" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.firstNameLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.lastNameLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.emailLabel}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.phoneLabel}</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} readOnly />
                  </FormControl>
                  <FormDescription>{dict.phoneDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.dobLabel}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      {...field}
                      value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="residenceCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.countryLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{dict.streetLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.cityLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.postalCodeLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
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
    </>
  );
}
