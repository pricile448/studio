
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr', 'de', 'es', 'pt']
const defaultLocale = 'fr'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exempter les routes admin de la logique de localisation
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Vérifier si une locale supportée est déjà dans le chemin
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Rediriger si aucune locale n'est présente, en ajoutant la locale par défaut.
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Exclure tous les chemins internes (_next) et les ressources statiques
    '/((?!api|_next/static|_next/image|favicon.ico|view-pdf).*)',
  ],
}
