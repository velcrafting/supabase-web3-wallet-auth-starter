import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const REFRESH_COOKIE = "refresh_token";
const NONCE_COOKIE = "siwe_nonce";

export async function POST() {
  const jar = await cookies();

  // Remove auth cookies (HTTP-only)
  jar.delete(SESSION_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(NONCE_COOKIE);

  // Also instruct the browser via response cookie headers (belt & suspenders)
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(NONCE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
