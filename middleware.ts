// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "session";
const AUTH_SECRET = process.env.AUTH_SECRET;

const BYPASS_PREFIXES = [
  "/_next",           // Next internals (chunks, HMR)
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/serviceWorker.js",
  "/assets",          // if you serve anything from /public/assets
  "/api",             // never auth-gate API via middleware unless you mean to
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never interfere with Next internals or public assets
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only protect /dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token || !AUTH_SECRET) return redirectToLogin(req);

  try {
    await jwtVerify(token, new TextEncoder().encode(AUTH_SECRET));
    return NextResponse.next();
  } catch {
    const res = redirectToLogin(req);
    // Clear simple cookie; if you originally set domain/path, also set expires:
    res.cookies.delete(SESSION_COOKIE_NAME);
    // res.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", expires: new Date(0) });
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
  // Run on everything, but we short-circuit early for assets/APIs above.
  matcher: "/:path*",
};
