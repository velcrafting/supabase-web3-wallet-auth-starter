// lib/actions/activity.ts
"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";

import { protectedProcedure } from "@/lib/actions/core";
import { activityLogs } from "@/lib/db/schema";
import { getSession } from "@/lib/actions/auth/session";
import { createDrizzleSupabaseClient } from "@/lib/db";

export async function recordActivity(
  db: any, // keep your existing Db type if you want
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
  .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(50).default(20) }))
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

/** SSR-safe read for RSCs: uses your RLS drizzle client internally */
export async function getActivityLogsSSR({ page = 1, limit = 20 }: { page?: number; limit?: number }) {
  const session = await getSession();
  if (!session) return null;

  const { rls } = await createDrizzleSupabaseClient();
  const offset = (page - 1) * limit;

  return rls(async (db) => {
    return db.query.activityLogs.findMany({
      where: eq(activityLogs.userId, session.user.id),
      orderBy: desc(activityLogs.createdAt),
      limit,
      offset,
    });
  });
}

/** Optional: wallet-scoped variant if you start recording wallet in metadata */
export async function getActivityByWalletsSSR({
  wallets,
  page = 1,
  limit = 20,
}: {
  wallets: `0x${string}`[];
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  if (!session) return null;

  const { rls } = await createDrizzleSupabaseClient();
  const offset = (page - 1) * limit;

  return rls(async (db) => {
    return db
      .select()
      .from(activityLogs)
      .where(sql`
        ${activityLogs.userId} = ${session.user.id}
        AND (
          (metadata->>'wallet') = ANY(${wallets}::text[])
          OR (metadata->>'walletAddress') = ANY(${wallets}::text[])
        )
      `)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
  });
}
