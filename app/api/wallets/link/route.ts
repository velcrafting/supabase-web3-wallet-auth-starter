// app/api/wallets/link/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSiweMessage, SiweMessage } from "viem/siwe";
import { createPublicClient, http, type Chain } from "viem";
import { verifyMessage } from "viem/actions";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/config";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { makeDegenUsername } from "@/lib/actions/username";

const NONCE_COOKIE_NAME = "siwe_nonce";
const SESSION_COOKIE_NAME = "session";

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const AUTH_SECRET = reqEnv("AUTH_SECRET");
const SUPABASE_URL = reqEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = reqEnv("SUPABASE_SERVICE_ROLE_KEY");
const isProd = process.env.NODE_ENV === "production";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    // 1) Parse JSON
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { message, signature } = body ?? {};
    if (typeof message !== "string" || typeof signature !== "string") {
      return NextResponse.json({ error: "Missing message or signature" }, { status: 400 });
    }

    // 2) Nonce from cookies
    const jar = await cookies();
    const cookieNonce = jar.get(NONCE_COOKIE_NAME)?.value ?? null;

    // 3) Parse SIWE
    const siwe = parseSiweMessage(message) as SiweMessage;
    const chainId = Number(siwe.chainId);
    if (!Number.isFinite(chainId)) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }

    // 4) Check nonce
    if (!cookieNonce || !siwe?.nonce || cookieNonce !== siwe.nonce) {
      return NextResponse.json({ error: "Invalid nonce" }, { status: 400 });
    }

    // 5) Verify signature
    const chain =
    (siteConfig.supportedChains.find((c) => c.id === chainId) as Chain | undefined) ??
    (siteConfig.supportedChains[0] as unknown as Chain);
    const publicClient = createPublicClient({ chain, transport: http() });
    const ok = await verifyMessage(publicClient, {
      address: siwe.address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 6) Normalize
    const walletAddress = siwe.address.toLowerCase();
    const chainId = Number(siwe.chainId);
    if (!Number.isFinite(chainId)) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }

    // 7) Supabase admin client
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 8) Does this wallet already exist?
    const { data: walletRow, error: walletErr } = await admin
      .from("user_wallets")
      .select("profile_id, user_id")
      .eq("wallet_address", walletAddress)
      .eq("chain_id", chainId)
      .maybeSingle();

    if (walletErr) {
      console.error("[link] user_wallets select error:", walletErr);
      return NextResponse.json({ error: "DB error (wallets)" }, { status: 500 });
    }

    let type: "signin" | "signup" | "link" = "signin";
    let profileId: string | null = walletRow?.profile_id ?? walletRow?.user_id ?? null;
    let username: string | null = null;

    if (!profileId) {
      // --- SIGN UP ---
      username = makeDegenUsername(walletAddress, true); // e.g., 0xStinkyUnicorn8c60
      const email = `${walletAddress}.${chainId}@wallet.local`; // avoid collisions per chain

      // 9) Create or fetch auth user
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { username, walletAddress, chainId },
        app_metadata: { provider: "walletconnect", providers: ["walletconnect"] },
      });

      let userId: string | null = created?.user?.id ?? null;
      let userEmail: string | null = created?.user?.email ?? email;

      if (createErr) {
        // If email already exists, fetch user id by email from auth schema
        const msg =
          (createErr as any)?.message ||
          (createErr as any)?.error_description ||
          (createErr as any)?.error ||
          "";

        if (msg.toLowerCase().includes("already been registered")) {
          const { data: existingUser, error: lookupErr } = await admin
            .schema("auth")
            .from("users")
            .select("id, email")
            .eq("email", email)
            .single();

          if (lookupErr || !existingUser?.id) {
            console.error("[link] lookup existing auth user failed:", lookupErr);
            return NextResponse.json({ error: "Failed to find existing user" }, { status: 500 });
          }
          userId = existingUser.id;
          userEmail = existingUser.email ?? email;
        } else {
          console.error("[link] admin.createUser failed:", createErr);
          return NextResponse.json(
            { error: msg || "Database error creating new user" },
            { status: 500 }
          );
        }
      }

      if (!userId) {
        return NextResponse.json({ error: "No user id" }, { status: 500 });
      }

      // 10) Upsert profile (profiles.id MUST equal auth.users.id)
      {
        const { error: profileErr } = await admin
          .from("profiles")
          .upsert(
            {
              id: userId,
              username,
              email: userEmail,
              wallet_address: walletAddress,
              chain_id: chainId,
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (profileErr) {
          console.error(`[link] profiles upsert error for user ${userId}:`, profileErr);
          return NextResponse.json({ error: "Failed to upsert profile" }, { status: 500 });
        }
      }

      profileId = userId;

      // 11) Link wallet with BOTH keys populated
      {
        const { error: insertErr } = await admin.from("user_wallets").insert({
          id: randomUUID(),
          user_id: userId,
          profile_id: userId,
          wallet_address: walletAddress,
          chain_id: chainId,
          is_primary: true,
          verified: true,
          created_at: new Date().toISOString(),
        });

        // ignore duplicate wallet error if unique constraint exists
        if (insertErr && insertErr.code !== "23505") {
          console.error("[link] user_wallets insert error:", insertErr);
          return NextResponse.json({ error: "Failed to link wallet" }, { status: 500 });
        }
      }

      type = "signup";
    } else {
      // --- SIGN IN ---
      // Fetch profile to grab username (and backfill if needed)
      const { data: prof, error: profErr } = await admin
        .from("profiles")
        .select("username")
        .eq("id", profileId)
        .maybeSingle();

      if (profErr) {
        console.error("[link] profiles select error:", profErr);
        return NextResponse.json({ error: "DB error (profiles)" }, { status: 500 });
      }

      username = prof?.username ?? `user_${walletAddress.slice(2, 8)}`;

      if (!prof?.username) {
        const { error: backfillErr } = await admin
          .from("profiles")
          .update({ username })
          .eq("id", profileId);
        if (backfillErr) {
          console.warn("[link] profiles username backfill failed:", backfillErr);
        }
      }

      // Ensure existing wallet row has both IDs set (in case of old data)
      if (walletRow && (!walletRow.user_id || !walletRow.profile_id)) {
        const { error: fixErr } = await admin
          .from("user_wallets")
          .update({
            user_id: walletRow.user_id ?? profileId,
            profile_id: walletRow.profile_id ?? profileId,
          })
          .eq("wallet_address", walletAddress)
          .eq("chain_id", chainId);

        if (fixErr) {
          console.warn("[link] user_wallets backfill of ids failed:", fixErr);
        }
      }

      type = "signin";
    }

    // 12) Mint app tokens (username guaranteed now)
    const { accessToken, refreshToken } = await createAppTokens({
      id: profileId!,
      username: username!,
      walletAddress,
      chainId,
    });

    // Consume nonce
    (await cookies()).delete(NONCE_COOKIE_NAME);

    // 13) Build response + set cookies
    const res = NextResponse.json({
      type,
      user: {
        id: profileId!,
        username: username!,
        walletAddress,
        chainId,
      },
      tookMs: Date.now() - t0,
    });

    await admin.from("activity_logs").insert({
      id: randomUUID(),
      user_id: profileId!,
      action: type,
      metadata: { walletAddress, chainId },
      created_at: new Date().toISOString(),
    });

    res.cookies.set(SESSION_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60, // 1h
    });

    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7d
    });

    return res;
  } catch (err: any) {
    console.error("[link] unhandled error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal Server Error" }, { status: 500 });
  }
}

async function createAppTokens(input: {
  id: string;
  username: string;
  walletAddress: string;
  chainId: number;
}) {
  const key = new TextEncoder().encode(AUTH_SECRET);
  const base = {
    aud: "authenticated",
    sub: input.id,
    role: "authenticated",
    user_metadata: { username: input.username },
    app_metadata: {
      provider: "walletconnect",
      providers: ["walletconnect"],
      walletAddress: input.walletAddress,
      chainId: input.chainId,
    },
  };

  const accessToken = await new SignJWT({ ...base, session_id: randomUUID() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const refreshToken = await new SignJWT({
    ...base,
    session_id: randomUUID(),
    type: "refresh_token",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  return { accessToken, refreshToken };
}
