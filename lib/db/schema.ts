import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  bigint,
  jsonb,
  foreignKey,
  pgPolicy,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey(),
    username: text().notNull(),
    email: text("email").notNull(),
    wallet_address: text("wallet_address").notNull(),
    chain_id: bigint("chain_id", { mode: "number" }).notNull(),

    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),

    total_wins: integer("total_wins").notNull().default(0),
    total_losses: integer("total_losses").notNull().default(0),
    current_streak: integer("current_streak").notNull().default(0),
    last_active: timestamp("last_active"),
  },
  (t) => [
    foreignKey({
      columns: [t.id],
      foreignColumns: [authUsers.id],
      name: "profiles_id_fk",
    }).onDelete("cascade"),

    pgPolicy("Enable read access for all users", {
      as: "permissive",
      to: "public",
      for: "select",
      using: sql`true`,
    }),

    pgPolicy("Enable update for users based on user id", {
      as: "permissive",
      to: authenticatedRole,
      for: "update",
      using: sql`(SELECT auth.uid()) = id`,
      withCheck: sql`(SELECT auth.uid()) = id`,
    }),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export const userWallets = pgTable(
  "user_wallets",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    chainId: bigint("chain_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("user_wallets_wallet_chain_unique").on(
      t.walletAddress,
      t.chainId,
    ),

    pgPolicy("Enable read access for all users", {
      as: "permissive",
      to: "public",
      for: "select",
      using: sql`true`,
    }),

    pgPolicy("Enable manage access for wallet owner", {
      as: "permissive",
      to: authenticatedRole,
      for: "all",
      using: sql`((SELECT auth.uid()) = user_id)`,
      withCheck: sql`((SELECT auth.uid()) = user_id)`,
    }),
  ],
);

export type UserWallet = typeof userWallets.$inferSelect;
export type NewUserWallet = typeof userWallets.$inferInsert;

export const nfts = pgTable(
  "nfts",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tokenId: bigint("token_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("nfts_token_id_unique").on(t.tokenId),

    pgPolicy("Enable read access for all users", {
      as: "permissive",
      to: "public",
      for: "select",
      using: sql`true`,
    }),

    pgPolicy("Enable manage access for token owner", {
      as: "permissive",
      to: authenticatedRole,
      for: "all",
      using: sql`((SELECT auth.uid()) = user_id)`,
      withCheck: sql`((SELECT auth.uid()) = user_id)`,
    }),
  ],
);

export type Nft = typeof nfts.$inferSelect;
export type NewNft = typeof nfts.$inferInsert;

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    action: text().notNull(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  () => [
    pgPolicy("Enable read access for owner", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`(SELECT auth.uid()) = user_id`,
    }),

    pgPolicy("Enable insert for owner", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`(SELECT auth.uid()) = user_id`,
    }),
  ],
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
