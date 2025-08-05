"use server";

import { publicProcedure } from "@/lib/actions/core";
import { cookies } from "next/headers";

export const logout = publicProcedure.action(async ({ ctx }) => {
  await ctx.supabase.anon.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token"); // if you're using defaults
  cookieStore.delete("sb-refresh-token");

  return true;
});