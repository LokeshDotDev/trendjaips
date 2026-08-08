import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Paths requiring authentication
  const isProtectedPath =
    pathname.startsWith("/buyer") ||
    pathname.startsWith("/supplier") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/negotiations");

  if (isProtectedPath && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buyer/:path*", "/supplier/:path*", "/admin/:path*", "/negotiations/:path*"],
};
