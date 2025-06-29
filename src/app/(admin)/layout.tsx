'use client';

import { ReactNode } from 'react';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { AdminLayoutClient } from './admin-layout-client';


export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutClient>
                {children}
            </AdminLayoutClient>
        </AdminAuthProvider>
    );
}
