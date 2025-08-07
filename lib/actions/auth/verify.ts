"use server";

import { z } from "zod";
import { parseSiweMessage, SiweMessage } from "viem/siwe";
import { cookies } from "next/headers";
import { publicProcedure, ActionError } from "@/lib/actions/core";
import { publicClient } from "@/lib/web3/server";
import { profiles, userWallets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const NONCE_COOKIE_NAME = "siwe_nonce";

function usernameFromAddress(addr: string) {
  return `user_${addr.slice(2, 8)}`;
}

/**
 * This action ONLY:
 * - verifies nonce + signature
 * - returns existing profile if the wallet is already known (type: "signin")
 * - when already signed in (ctx.session.user.id), links the wallet (type: "link")
 *
 * New account creation + profile upsert + cookie minting
 * happens in /api/wallets/link.
 */
export const verify = publicProcedure
  .input(z.object({ message: z.string(), signature: z.string() }))
  .action(async ({ ctx, input: { message, signature } }) => {
    const cookieStore = await cookies();

    const siwe = parseSiweMessage(message) as SiweMessage;
    const expectedNonce = cookieStore.get(NONCE_COOKIE_NAME)?.value;

    if (!expectedNonce || expectedNonce !== siwe.nonce) {
      throw new ActionError({ message: "Invalid nonce", code: 400 });
    }

    const ok = await publicClient.verifyMessage({
      address: siwe.address,
      message,
      signature: signature as `0x${string}`,
    });

    if (!ok) {
      throw new ActionError({ message: "Invalid signature", code: 401 });
    }

    const walletAddress = siwe.address.toLowerCase();
    const chainId = Number(siwe.chainId);
    if (!Number.isFinite(chainId)) {
      throw new ActionError({ message: "Invalid chainId", code: 400 });
    }

    // 1) Already linked?
    const existingWallet = await ctx.db.query.userWallets.findFirst({
      where: and(
        eq(userWallets.walletAddress, walletAddress),
        eq(userWallets.chainId, chainId)
      ),
    });

    if (existingWallet) {
      // Note: your Drizzle schema has `userId`, not `profileId`
      const prof = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, existingWallet.userId),
      });
      if (!prof) throw new ActionError({ message: "Profile not found", code: 404 });

      cookieStore.delete(NONCE_COOKIE_NAME);

      return {
        type: "signin" as const,
        user: {
          id: prof.id,
          username: prof.username ?? usernameFromAddress(walletAddress),
          walletAddress,
          chainId,
        },
      };
    }

    // 2) Not linked yet; if user is signed in, link this wallet to their profile
    if (ctx.session?.user.id) {
      const prof = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, ctx.session.user.id),
      });
      if (!prof) throw new ActionError({ message: "Profile not found", code: 404 });

      await ctx.db.insert(userWallets).values({
        id: randomUUID(),
        userId: prof.id, // << matches your schema type
        walletAddress,
        chainId,
      });

      cookieStore.delete(NONCE_COOKIE_NAME);

      return {
        type: "link" as const,
        user: {
          id: prof.id,
          username: prof.username ?? usernameFromAddress(walletAddress),
          walletAddress,
          chainId,
        },
      };
    }

    // 3) Not signed in and wallet not known -> signal the client to hit /api/wallets/link for signup
    cookieStore.delete(NONCE_COOKIE_NAME);
    return {
      type: "needs_signup" as const,
      siwe: { address: walletAddress, chainId },
    };
  });
