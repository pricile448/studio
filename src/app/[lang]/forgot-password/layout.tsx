import { ReactNode } from 'react';
import { Providers } from '@/app/providers';

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}