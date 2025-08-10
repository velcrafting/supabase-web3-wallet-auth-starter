"use client";

import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/hooks";

const WalletActivityButton = () => {
  const { data: session } = useSession();  // Get session data
  const { open } = useAppKit();  // AppKit open method

  if (!session) {
    return null;  // Don't render if the user is not authenticated
  }

  return (
    <Button onClick={() => open({ view: "Account" })} className="mb-4">
      View Wallet Activity
    </Button>
  );
};

export default WalletActivityButton;