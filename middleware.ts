import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "session";
const AUTH_SECRET = process.env.AUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !AUTH_SECRET) return redirectToLogin(req);

  try {
    await jwtVerify(token, new TextEncoder().encode(AUTH_SECRET));
    return NextResponse.next();
  } catch {
    const res = redirectToLogin(req);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};