
'use client';

import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
