"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { protectedProcedure } from "@/lib/actions/core";
import { Db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";

export async function recordActivity(
  db: Db,
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  await db.insert(activityLogs).values({
    id: randomUUID(),
    userId,
    action,
    metadata,
  });
}

export const logActivity = protectedProcedure
  .input(z.object({ action: z.string(), metadata: z.any().optional() }))
  .action(async ({ ctx, input }) => {
    await recordActivity(ctx.db, ctx.session.user.id, input.action, input.metadata ?? {});
    return true;
  });

export const getActivityLogs = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
  )
  .action(async ({ ctx, input }) => {
    const { page, limit } = input;
    const offset = (page - 1) * limit;

    return ctx.db.query.activityLogs.findMany({
      where: eq(activityLogs.userId, ctx.session.user.id),
      orderBy: desc(activityLogs.createdAt),
      limit,
      offset,
    });
  });