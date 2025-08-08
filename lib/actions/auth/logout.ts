"use server";

import { publicProcedure } from "@/lib/actions/core";
import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/constants";
import { recordActivity } from "@/lib/actions/activity";

export const logout = publicProcedure.action(async ({ ctx }) => {
  await ctx.supabase.anon.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  cookieStore.delete(`${sessionCookieName}-refresh-token`);

  if (ctx.session) {
    await recordActivity(ctx.db, ctx.session.user.id, "logout");
  }

  return true;
});