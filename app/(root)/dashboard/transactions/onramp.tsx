"use client";

import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth/session-context";
import type { useAppKit } from "@reown/appkit/react";

type OpenFn = ReturnType<typeof useAppKit>["open"];

interface OnrampTabProps {
  session: Session | null | undefined;
  open: OpenFn;
}

const OnrampTab: React.FC<OnrampTabProps> = ({ session, open }) => {
  if (!session) {
    return null;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">On-Ramp</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <Button onClick={() => open({ view: "OnRampProviders" })}>
          Buy Crypto
        </Button>
      </div>
    </>
  );
};

export default OnrampTab;