import { getSession as getSupabaseSession } from "@/lib/supabase";
import { createDrizzleSupabaseClient } from "@/lib/db";
import { userWallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type Session = {
  user: {
    id: string;
    username: string;
    walletAddress: string;
    chainId: string;
  };
};

export async function getSession(): Promise<Session | null> {
  const session = await getSupabaseSession();

  if (!session) {
    return null;
  }

  const db = await createDrizzleSupabaseClient();
  const wallet = await db.rls((tx) =>
    tx.query.userWallets.findFirst({
      where: eq(userWallets.userId, session.user.id),
    }),
  );

  return {
    user: {
      id: session.user.id,
      username: session.user.user_metadata.username,
      walletAddress: wallet?.walletAddress ?? "",
      chainId: wallet?.chainId ?? "",
    },
  };
}