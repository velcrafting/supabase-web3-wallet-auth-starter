"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "@/lib/actions/core";
import { userWallets } from "@/lib/db/schema";

export const getWallets = protectedProcedure.action(async ({ ctx }) => {
  return ctx.db.query.userWallets.findMany({
    where: eq(userWallets.userId, ctx.session.user.id),
  });
});

export const removeWallet = protectedProcedure
  .input(z.object({ id: z.string() }))
  .action(async ({ ctx, input }) => {
    await ctx.db
      .delete(userWallets)
      .where(
        and(
          eq(userWallets.id, input.id),
          eq(userWallets.userId, ctx.session.user.id),
        ),
      );

    return true;
  });