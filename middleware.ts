import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic middleware that just continues the request
export function middleware(request: NextRequest) {
  // Hier können Sie Middleware-Logik hinzufügen
  return NextResponse.next()
}

// Optional: Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 