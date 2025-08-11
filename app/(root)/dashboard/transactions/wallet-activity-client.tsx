"use client";

import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth/session-context";

interface WalletActivityButtonProps {
  open: (options: { view: string }) => void;
  session: Session | null | undefined;
}

const WalletActivityButton: React.FC<WalletActivityButtonProps> = ({ open, session }) => {
  if (!session) {
    return null;
  }

  return (
    <Button onClick={() => open({ view: "Account" })} className="mb-4">
      View Wallet Activity
    </Button>
  );
};

export default WalletActivityButton;