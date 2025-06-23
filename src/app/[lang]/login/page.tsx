
import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/dictionaries';

// This page has been moved to /app/[lang]/page.tsx to simplify routing.
// This page will now redirect to the new root page.
export default function LoginPage({ params: { lang } }: { params: { lang: Locale } }) {
  redirect(`/${lang}`)
}
