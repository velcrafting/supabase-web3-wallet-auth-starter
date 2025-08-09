// app/(dashboard)/portfolio/_components/wallet-picker.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function WalletPicker({ selected }: { selected?: `0x${string}` }) {
  const { address } = useAccount();
  const router = useRouter();
  const sp = useSearchParams();

  const [value, setValue] = useState(selected ?? address ?? "");

  useEffect(() => {
    // If URL has no wallet, default to connected address once
    if (!selected && address) setValue(address);
  }, [address, selected]);

  function apply(next: string) {
    const params = new URLSearchParams(sp?.toString());
    if (next) params.set("wallet", next);
    else params.delete("wallet");
    params.delete("page"); // reset pagination on wallet change
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className="border rounded px-2 py-1 w-[28rem] max-w-full"
        placeholder="0x… wallet address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="border rounded px-2 py-1" onClick={() => apply(value.trim())}>
        Load
      </button>
      {selected && (
        <button className="border rounded px-2 py-1" onClick={() => apply("")}>
          Clear
        </button>
      )}
    </div>
  );
}
