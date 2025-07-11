
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Hourglass } from 'lucide-react';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { useUserProfile } from '@/context/user-profile-context';

interface VerificationBannerProps {
  dict: Dictionary['dashboard']['verificationBanner'];
  lang: Locale;
}

export function VerificationBanner({ dict, lang }: VerificationBannerProps) {
  const { userProfile } = useUserProfile();
  
  if (!userProfile || userProfile.kycStatus === 'verified') {
    return null;
  }
  
  if (userProfile.kycStatus === 'pending') {
     return (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800/60">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Hourglass className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">{dict.pending_title}</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{dict.pending_description}</p>
                    </div>
                </div>
            </div>
        </div>
     )
  }

  // kycStatus is 'unverified'
  return (
    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/60">
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-amber-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">{dict.title}</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{dict.description}</p>
                </div>
            </div>
            <Button asChild>
                <Link href={`/${lang}/kyc`}>{dict.button}</Link>
            </Button>
        </div>
    </div>
  );
}
