import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("logged_in")?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // ❌ Not logged in → redirect to login
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Logged in but trying to open login again
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

/* 🔒 Middleware kis path pe chale */
export const config = {
  matcher: ["/", "/login"],
};
