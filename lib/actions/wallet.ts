"use server";

import { eq } from "drizzle-orm";
import { protectedProcedure } from "@/lib/actions/core";
import { userWallets } from "@/lib/db/schema";

export const getWallets = protectedProcedure.action(async ({ ctx }) => {
  return ctx.db.query.userWallets.findMany({
    where: eq(userWallets.userId, ctx.session.user.id),
  });
});