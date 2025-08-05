"use server";

import { z } from "zod";
import { parseSiweMessage, SiweMessage } from "viem/siwe";
import { cookies } from "next/headers";
import { publicProcedure, ActionError } from "@/lib/actions/core";
import { publicClient } from "@/lib/web3/server";
import { profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateDegenerateUsername } from "@/lib/utils";
import { randomUUID } from "crypto";
import { SignJWT, type JWTPayload } from "jose";

const NONCE_COOKIE_NAME = "siwe_nonce";
const SESSION_COOKIE_NAME = "session";
const JWT_SECRET = process.env.JWT_SECRET!;

const createSignedSessionToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET));
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
    const chainId = siweMessage.chainId;

    let userProfile = await ctx.db.query.profiles.findFirst({
      where: and(
        eq(profiles.walletAddress, walletAddress),
        eq(profiles.chainId, chainId)
      ),
    });

    let type: "signin" | "signup" = "signin";

    if (!userProfile) {
      const [created] = await ctx.db
        .insert(profiles)
        .values({
          id: randomUUID(),
          walletAddress,
          chainId,
          username: generateDegenerateUsername(walletAddress),
        })
        .returning();

      if (!created?.id) {
        throw new ActionError({ message: "Failed to create profile", code: 500 });
      }

      userProfile = created;
      type = "signup";
    }

    // Delete nonce
    cookieStore.delete(NONCE_COOKIE_NAME);

    // Create and store JWT session
    const token = await createSignedSessionToken({
      id: userProfile.id,
      walletAddress: userProfile.walletAddress,
      chainId: userProfile.chainId,
      username: userProfile.username,
    });

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      type,
      user: {
        id: userProfile.id,
        walletAddress: userProfile.walletAddress,
        chainId: userProfile.chainId,
        username: userProfile.username,
      },
    };
  });