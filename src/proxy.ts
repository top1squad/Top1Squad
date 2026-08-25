import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/tournaments",
  "/my-tournaments",
  "/my-matches",
  "/leaderboard",
  "/profile",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // CHECK IF ROUTE IS PROTECTED
  // ==========================================

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Public route
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // ==========================================
  // CHECK EXPRESS PASSPORT SESSION
  // ==========================================

  try {
    const cookieHeader =
      request.headers.get("cookie") || "";

    const response = await fetch(
      "http://localhost:5001/api/auth/me",
      {
        method: "GET",

        headers: {
          Cookie: cookieHeader,
        },

        cache: "no-store",
      }
    );

    // ========================================
    // EXPRESS SESSION CHECK FAILED
    // ========================================

    if (!response.ok) {
      return redirectToLogin(request);
    }

    const data = await response.json();

    console.log(
      "PROXY AUTH:",
      data.authenticated
    );

    // ========================================
    // USER NOT LOGGED IN
    // ========================================

    if (
      data.success !== true ||
      data.authenticated !== true
    ) {
      return redirectToLogin(request);
    }

    // ========================================
    // USER IS LOGGED IN
    // ========================================

    return NextResponse.next();

  } catch (error) {
    console.error(
      "Proxy authentication error:",
      error
    );

    return redirectToLogin(request);
  }
}

// ==========================================
// REDIRECT USER TO LOGIN
// ==========================================

function redirectToLogin(
  request: NextRequest
) {
  const loginUrl = new URL(
    "/login",
    request.url
  );

  loginUrl.searchParams.set(
    "redirect",
    request.nextUrl.pathname
  );

  return NextResponse.redirect(
    loginUrl
  );
}

// ==========================================
// PROTECTED ROUTES
// ==========================================

export const config = {
  matcher: [
    "/tournaments/:path*",
    "/my-tournaments/:path*",
    "/my-matches/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
  ],
};