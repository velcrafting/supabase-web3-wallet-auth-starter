// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const SESSION_COOKIE = "session";

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const AUTH_SECRET = reqEnv("AUTH_SECRET");
const SUPABASE_URL = reqEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE = reqEnv("SUPABASE_SERVICE_ROLE_KEY");

const isProd = process.env.NODE_ENV === "production";

function usernameFromAddress(addr: string) {
  return `user_${addr.slice(2, 8)}`;
}

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify our app-issued JWT
    const key = new TextEncoder().encode(AUTH_SECRET);
    const { payload }: any = await jwtVerify(token, key);

    // Pull what we can from the token
    const id: string = payload?.sub;
    const app = payload?.app_metadata ?? {};
    const meta = payload?.user_metadata ?? {};

    let walletAddress: string | undefined = app.walletAddress;
    let chainId: number | undefined = app.chainId;
    let username: string | undefined = meta.username;

    // If username is missing in the token (older sessions), fetch from DB
    if (!username && id) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: profile } = await admin
        .from("profiles")
        .select("username, wallet_address, chain_id")
        .eq("id", id)
        .maybeSingle();

      if (profile) {
        username = profile.username ?? usernameFromAddress(profile.wallet_address);
        walletAddress = walletAddress ?? profile.wallet_address;
        chainId = chainId ?? profile.chain_id;
      }
    }

    // Final fallbacks (should be rare)
    if (!username && walletAddress) {
      username = usernameFromAddress(walletAddress);
    }

    if (!id || !walletAddress || !chainId) {
      // Session exists but missing critical fields – treat as logged out
      // and clear cookie to avoid loops.
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.set(SESSION_COOKIE, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
      });
      return res;
    }

    return NextResponse.json(
      {
        user: {
          id,
          username,
          walletAddress,
          chainId,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    // On any verification error, clear cookie and return no user
    const res = NextResponse.json({ user: null }, { status: 200 });
    res.cookies.set(SESSION_COOKIE, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
    });
    return res;
  }
}

