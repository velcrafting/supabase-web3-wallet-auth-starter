import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "session";

export async function middleware(request: NextRequest) {
  // This middleware only runs on /dashboard via the matcher below.
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return redirectToHome(request);

  try {
    const secret = process.env.AUTH_SECRET; // was JWT_SECRET. Your tokens are signed with AUTH_SECRET.
    if (!secret) throw new Error("AUTH_SECRET is not set");
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch (err) {
    console.warn("Invalid or expired JWT:", err);
    return redirectToHome(request);
  }
}

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

// Only protect the dashboard. Do not touch /api or anything else.
export const config = {
  matcher: ["/dashboard/:path*"],
};
