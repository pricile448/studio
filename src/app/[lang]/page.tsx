
import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/dictionaries'

export default function RootPage({ params }: { params: { lang: Locale } }) {
  redirect(`/${params.lang}/login`)
}
