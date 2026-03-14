import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/register/agent',
  '/register/patient',
  '/register/hospital',
  '/',
  '/api/upload',
  '/api/gemini/extract'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (you can customize this based on your Firebase setup)
  const session = request.cookies.get('session')?.value;
  
  if (!session && !pathname.startsWith('/api')) {
    // Redirect to login if no session and not an API route
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};