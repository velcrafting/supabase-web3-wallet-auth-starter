"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks";
import { useAppKit } from "@reown/appkit/react";
import OnrampTab from "./onramp";
import SwapTab from "./swap";
import HistoryTab from "./history";

type Tab = "onramp" | "swap" | "history";

const TransactionsPage = () => {
  const { data: session } = useSession();
  const { open } = useAppKit();

  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = (searchParams.get("tab") as Tab) || "onramp";
  const [activeTab, setActiveTab] = useState<Tab>(initial);

  useEffect(() => {
    const t = (searchParams.get("tab") as Tab) || "onramp";
    setActiveTab(t);
  }, [searchParams]);

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`);
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "onramp" ? "bg-gray-200 dark:bg-gray-700" : "bg-transparent"}`}
          onClick={() => changeTab("onramp")}
        >
          Onramp
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "swap" ? "bg-gray-200 dark:bg-gray-700" : "bg-transparent"}`}
          onClick={() => changeTab("swap")}
        >
          Swap
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "history" ? "bg-gray-200 dark:bg-gray-700" : "bg-transparent"}`}
          onClick={() => changeTab("history")}
        >
          History
        </button>
      </div>

      {activeTab === "onramp" && <OnrampTab session={session} open={open} />}
      {activeTab === "swap" && <SwapTab session={session} open={open} />}
      {activeTab === "history" && <HistoryTab session={session} open={open} />}
    </div>
  );
};

export default TransactionsPage;