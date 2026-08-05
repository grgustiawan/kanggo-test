import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const accessToken = request.cookies.get("access_token")?.value;

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return NextResponse.next();
  }

  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/_next',
    '/favicon.ico',
    '/images',
    '/public',
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.toLowerCase() === route.toLowerCase() ||
    pathname.toLowerCase().startsWith(route.toLowerCase())
  );

  const isAuthenticated = !!accessToken;

  if (pathname.startsWith('/api/')) {
    if (!isAuthenticated && !isPublicRoute) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    return NextResponse.next();
  }

  if (isAuthenticated && isPublicRoute && !pathname.startsWith('/_next') && pathname !== '/') {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico).*)',
  ],
};
