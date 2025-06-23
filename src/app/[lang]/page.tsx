
import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/dictionaries';

// This root page now performs an absolute redirect to the login page for the current language.
export default function RootPage({ params: { lang } }: { params: { lang: Locale } }) {
  redirect(`/${lang}/login`)
}
