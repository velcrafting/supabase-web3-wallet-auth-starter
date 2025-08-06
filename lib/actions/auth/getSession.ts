import { getSession as getSupabaseSession } from "@/lib/supabase";

export type Session = {
  user: {
    id: string;
    username: string;
    walletAddress: string;
    chainId: number;
  };
};

export async function getSession(): Promise<Session | null> {
  const session = await getSupabaseSession();

  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      username: session.user.user_metadata.username,
      walletAddress: session.user.app_metadata.walletAddress,
      chainId: session.user.app_metadata.chainId,
    },
  };
}