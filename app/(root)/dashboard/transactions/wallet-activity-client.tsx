"use client";

import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth/session-context";
import type { useAppKit } from "@reown/appkit/react";

type OpenFn = ReturnType<typeof useAppKit>["open"];

interface WalletActivityButtonProps {
  open: OpenFn;
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