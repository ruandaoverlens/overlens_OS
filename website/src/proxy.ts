import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Set to true to bypass auth during development
const BYPASS_AUTH = false;

const PUBLIC_ROUTES = ["/login", "/auth"];

export async function proxy(request: NextRequest) {
  if (BYPASS_AUTH) return NextResponse.next();

  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    // If logged in and visiting /login, redirect to /docs
    if (user && pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/docs";
      const redirect = NextResponse.redirect(url);
      // Forward session cookies so refreshed tokens aren't lost
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie.name, cookie.value);
      });
      return redirect;
    }
    return supabaseResponse;
  }

  // No user → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|ogg|wav|woff|woff2|ttf|eot)$).*)",
  ],
};
