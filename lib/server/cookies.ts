import "server-only";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import type { CookieOptionsWithName } from "@supabase/ssr";
import type { SupabaseToken } from "@/lib/supabase";
import { sessionCookieName } from "@/lib/constants";

export async function getCookieOptions(): Promise<CookieOptionsWithName> {
  let maxAge: number | undefined;
  let expires: Date | undefined;

  const cookieStore = await cookies(); // <- your TS expects a Promise
  const token = cookieStore.get(sessionCookieName)?.value;
  const decoded = token ? decodeJwt<SupabaseToken>(token) : null;

  if (decoded && typeof decoded.exp === "number") {
    const expMs = decoded.exp * 1000;
    maxAge = Math.max(0, Math.floor((expMs - Date.now()) / 1000));
    expires = new Date(expMs);
  }

  return {
    name: sessionCookieName,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    ...(typeof maxAge === "number" ? { maxAge } : {}),
    ...(expires ? { expires } : {}),
  };
}
