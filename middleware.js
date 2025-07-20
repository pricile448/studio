import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirige toutes les requêtes vers la page de maintenance
  return NextResponse.rewrite(new URL('/maintenance.html', request.url))
}

export const config = {
  matcher: ['/((?!maintenance.html|_next/static|favicon.ico).*)'],
}
