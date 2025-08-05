"use server";

import { generateSiweNonce } from "viem/siwe";
import { cookies } from "next/headers";
import { publicProcedure } from "@/lib/actions/core";

const NONCE_COOKIE = "siwe_nonce";

export const nonce = publicProcedure.action(async () => {
  const cookieStore = await cookies(); // ✅ await added

  const nonce = generateSiweNonce();

  cookieStore.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return { nonce };
});