"use server";

import { z } from "zod";
import { parseSiweMessage, SiweMessage } from "viem/siwe";
import { cookies } from "next/headers";
import { publicProcedure, ActionError } from "@/lib/actions/core";
import { publicClient } from "@/lib/web3/server";
import { profiles, userWallets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateDegenerateUsername } from "@/lib/utils";
import { randomUUID } from "crypto";
import { SignJWT } from "jose";

const NONCE_COOKIE_NAME = "siwe_nonce";
const AUTH_SECRET = process.env.AUTH_SECRET!;

const createSupabaseTokens = async ({
  id,
  username,
  walletAddress,
  chainId,
}: {
  id: string;
  username: string;
  walletAddress: string;
  chainId: number;
}) => {
  const key = new TextEncoder().encode(AUTH_SECRET);
  const basePayload = {
    aud: "authenticated",
    sub: id,
    role: "authenticated",
    user_metadata: { username },
    app_metadata: {
      provider: "walletconnect",
      providers: ["walletconnect"],
      walletAddress,
      chainId,
    },
  };

  const accessToken = await new SignJWT({
    ...basePayload,
    session_id: randomUUID(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const refreshToken = await new SignJWT({
    ...basePayload,
    session_id: randomUUID(),
    type: "refresh_token",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  return { accessToken, refreshToken };
};

export const verify = publicProcedure
  .input(z.object({ message: z.string(), signature: z.string() }))
  .action(async ({ ctx, input: { message, signature } }) => {
    const cookieStore = await cookies();

    const siweMessage = parseSiweMessage(message) as SiweMessage;
    const expectedNonce = cookieStore.get(NONCE_COOKIE_NAME)?.value;

    if (!expectedNonce || expectedNonce !== siweMessage.nonce) {
      throw new ActionError({ message: "Invalid nonce", code: 400 });
    }

    const valid = await publicClient.verifyMessage({
      address: siweMessage.address,
      message,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      throw new ActionError({ message: "Invalid signature", code: 401 });
    }

    const walletAddress = siweMessage.address.toLowerCase();
    const chainId = Number(siweMessage.chainId);

    if (Number.isNaN(chainId)) {
      throw new ActionError({ message: "Invalid chainId", code: 400 });
    }

    const existingWallet = await ctx.db.query.userWallets.findFirst({
      where: and(
        eq(userWallets.walletAddress, walletAddress),
        eq(userWallets.chainId, chainId)
      ),
    });

    let userProfile;
    let type: "signin" | "signup" | "link" = "signin";

    if (existingWallet) {
      userProfile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, existingWallet.userId),
      });
      if (!userProfile) {
        throw new ActionError({ message: "Profile not found", code: 404 });
      }
    } else if (ctx.session?.user.id) {
      // Link new wallet to existing user
      userProfile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, ctx.session.user.id),
      });
      if (!userProfile) {
        throw new ActionError({ message: "Profile not found", code: 404 });
      }
      await ctx.db.insert(userWallets).values({
        id: randomUUID(),
        userId: userProfile.id,
        walletAddress,
        chainId,
      });
      type = "link";
    } else {
      // Create Supabase user (and mirror to local DB)
      const username = generateDegenerateUsername(walletAddress);
      const email = `${walletAddress}@wallet.local`;

      const { data, error } = await ctx.supabase.serviceRole.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { username, walletAddress, chainId },
        app_metadata: {
          provider: "walletconnect",
          providers: ["walletconnect"],
        },
      });

      if (error || !data?.user?.id) {
        console.error("❌ Supabase user creation error:", error);
        throw new ActionError({ message: "Failed to create user", code: 500 });
      }

      const id = data.user.id;

      await ctx.db.insert(userWallets).values({
        id: randomUUID(),
        userId: id,
        walletAddress,
        chainId,
      });

      await ctx.db.insert(profiles).values({
        id,
        username,
        email,
        wallet_address: walletAddress,
        chain_id: chainId,
      });

      userProfile = { id, username };
      type = "signup";
    }

    cookieStore.delete(NONCE_COOKIE_NAME);

    if (type !== "link") {
      const { accessToken, refreshToken } = await createSupabaseTokens({
        id: userProfile.id,
        username: userProfile.username,
        walletAddress,
        chainId,
      });

      await ctx.supabase.anon.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    return {
      type,
      user: {
        id: userProfile.id,
        walletAddress,
        chainId,
        username: userProfile.username,
      },
    };
  });