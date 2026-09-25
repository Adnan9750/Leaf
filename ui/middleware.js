// d:/Leaf/ui/middleware.js
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/admin"];

// Routes only accessible to guests (not logged-in users)
const guestOnlyRoutes = ["/login", "/"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Auth cookie set by the frontend after successful Django login
  const authCookie = request.cookies.get("is_authenticated");
  const isAuthenticated = authCookie?.value === "true";

  // --- Protected routes: redirect to /login if NOT authenticated ---
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // --- Guest-only routes: redirect to /admin/dashboard if authenticated ---
  const isGuestRoute = guestOnlyRoutes.some((route) => pathname === route);

  if (isGuestRoute && isAuthenticated) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Only run middleware on relevant paths (skip static files, api, _next, etc.)
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
