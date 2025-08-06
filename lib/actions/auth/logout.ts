"use server";

import { publicProcedure } from "@/lib/actions/core";
import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/constants";

export const logout = publicProcedure.action(async ({ ctx }) => {
  await ctx.supabase.anon.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  cookieStore.delete(`${sessionCookieName}-refresh-token`);

  return true;
});