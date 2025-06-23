
import { getDictionary, type Locale } from '@/lib/dictionaries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This page is deprecated. The main page / is now the login page.
export default async function LoginPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">This page is no longer in use.</h1>
        <p className="text-muted-foreground mb-8">The login form is now at the main page.</p>
        <Button asChild>
            <Link href={`/${lang}`}>Go to Login</Link>
        </Button>
    </div>
  )
}
