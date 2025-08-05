"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { publicProcedure, ActionError } from "@/lib/actions/core";
import { eq } from "drizzle-orm";
import { profiles } from "@/lib/db/schema";

export const register = publicProcedure
  .input(z.object({ username: z.string().min(3).optional() }))
  .action(async ({ ctx, input }) => {
    const { username } = input;
    const { session, db, supabase } = ctx;

    if (!session?.user?.id) {
      throw new ActionError({ message: "Missing user session", code: 401 });
    }

    // Skip update if no username provided
    if (!username) {
      redirect("/dashboard");
      return;
    }

    const existing = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });

    if (existing) {
      throw new ActionError({ message: "Username already taken", code: 400 });
    }

    await db
      .update(profiles)
      .set({ username })
      .where(eq(profiles.id, session.user.id));

    await supabase.anon.auth.updateUser({
      data: {
        username,
        display_name: `@${username}`,
      },
    });

    await supabase.anon.auth.refreshSession();

    redirect("/dashboard");
  });