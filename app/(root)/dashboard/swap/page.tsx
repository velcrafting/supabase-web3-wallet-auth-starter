"use client";

import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/hooks";

const DashboardSwapPage = () => {
  const { data: session } = useSession();
  const { open } = useAppKit();

  if (!session) {
    return null;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Swap</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <Button onClick={() => open({ view: "Swap" })}>Swap Tokens</Button>
      </div>
    </>
  );
};

export default DashboardSwapPage;