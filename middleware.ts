import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, errors } from "jose";

const SESSION_COOKIE_NAME = "session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return redirectToHome(request);

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET is not set");

    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch (err) {
    // Token invalid or expired. Redirect and nuke the cookie in Edge.
    const res = redirectToHome(request);
    res.cookies.delete(SESSION_COOKIE_NAME);
    // If you set domain/path on the cookie, mirror them on deletion.
    // res.cookies.set(SESSION_COOKIE_NAME, "", { expires: new Date(0), path: "/" });
    return res;
  }
}

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard/:path*"] };
