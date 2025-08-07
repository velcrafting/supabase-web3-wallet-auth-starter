import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  foreignKey,
  uuid,
  pgPolicy,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey(),
    username: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
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
    walletAddress: text().notNull(),
    chainId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
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