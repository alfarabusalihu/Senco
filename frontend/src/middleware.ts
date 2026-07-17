import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route access rules
const PUBLIC_ROUTES = ['/login', '/register'];
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for refresh token cookie (httpOnly)
  const refreshToken = request.cookies.get('refreshToken');
  
  // If no refresh token and trying to access protected route
  if (!refreshToken && !PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If has token but trying to access auth routes, redirect to dashboard
  if (refreshToken && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // For manager-only routes, we need to verify the role
  // Since we can't easily verify the role in middleware without making API calls,
  // we'll handle this in the client-side layout with a better UX
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
