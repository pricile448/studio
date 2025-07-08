
'use client';

// This component is no longer used directly in the root layout
// to resolve a chunk loading issue. The providers are now
// initialized directly in `src/app/layout.tsx`.
// This file is kept to avoid breaking potential imports in other files,
// although it is now effectively unused in the main application flow.

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
