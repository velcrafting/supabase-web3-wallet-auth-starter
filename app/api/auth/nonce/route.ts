// app/api/auth/nonce/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateSiweNonce } from "viem/siwe";

const NONCE_COOKIE = "siwe_nonce";

export async function GET() {
  const nonce = generateSiweNonce();
  const isProd = process.env.NODE_ENV === "production";

  // Set nonce cookie on the response
  const res = NextResponse.json({ nonce });
  res.cookies.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
  });

  return res;
}
