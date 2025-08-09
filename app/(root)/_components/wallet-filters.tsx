"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function WalletFilters({
  allWallets,
  selected,
}: {
  allWallets: `0x${string}`[];
  selected: `0x${string}`[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const isAll = selected.length === allWallets.length;

  function apply(next: `0x${string}`[]) {
    const params = new URLSearchParams(sp?.toString());
    if (next.length === allWallets.length) {
      params.delete("wallets"); // all
    } else {
      params.set("wallets", next.join(","));
    }
    params.delete("page"); // reset pagination on filter change
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        className={`px-2 py-1 rounded border ${isAll ? "bg-gray-200 dark:bg-gray-700" : ""}`}
        onClick={() => apply(allWallets)}
      >
        All
      </button>
      {allWallets.map((w) => {
        const on = selected.includes(w);
        return (
          <button
            key={w}
            className={`px-2 py-1 rounded border ${on ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            onClick={() => {
              const next = on ? selected.filter(x => x !== w) : [...selected, w];
              if (next.length === 0) return; // never empty
              apply(next as `0x${string}`[]);
            }}
            title={w}
          >
            {w.slice(0, 6)}…{w.slice(-4)}
          </button>
        );
      })}
    </div>
  );
}
