// lib/supabase.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import { getCookieOptions } from "@/lib/server/cookies";

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

export type SupabaseToken = {
  aal: string;
  aud: string;
  email: string;
  exp: number;
  iat: number;
  phone: string;
  role: string;
  session_id: string;
  sub: string;
  amr?: { method: string; timestamp: number }[];
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  is_anonymous?: boolean;
  iss?: string;
  jti?: string;
  nbf?: string;
  user_metadata?: {
    [key: string]: any;
  };
} & {
  app_metadata: {
    provider: "walletconnect";
    providers: ["walletconnect"];
    chainId: string;
    walletAddress: `0x${string}`;
  };
  user_metadata: {
    username: string;
  };
};

/**
 * Anonymous client for SSR that reads/writes auth cookies.
 * Use this for normal user session reads/writes.
 */
export async function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!anon) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");

  const cookieStore = await cookies();
  const cookieOptions = await getCookieOptions();

  return createServerClient(url, anon, {
    cookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client.
 * Do NOT use the SSR helper here; do NOT attach cookies.
 * This must stay isolated and stateless.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!serviceRole) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Role": "service" } }, // optional, helpful in logs
  });
}

/**
 * Reads the current Supabase session via anon client,
 * then validates your custom JWT (signed with AUTH_SECRET) and returns a normalized shape.
 */
export async function getSession() {
  const AUTH_SECRET = process.env.AUTH_SECRET;
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET is not set");

  const supabase = await createAnonClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!session || error) return null;

  try {
    const key = new TextEncoder().encode(AUTH_SECRET);
    const { payload: decoded }: { payload: SupabaseToken } = await jwtVerify(
      session.access_token,
      key,
    );

    const validatedSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: decoded.exp,
      expires_in: decoded.exp - Math.round(Date.now() / 1000),
      token_type: "bearer",
      user: {
        app_metadata: decoded.app_metadata,
        aud: "authenticated",
        created_at: "",
        id: decoded.sub,
        user_metadata: {
          username: decoded.user_metadata.username,
        },
      },
    };

    return validatedSession;
  } catch {
    return null;
  }
}
