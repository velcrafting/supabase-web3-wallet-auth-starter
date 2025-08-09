// app/(dashboard)/portfolio/_components/wallet-picker.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";

const isHexAddress = (s: string): s is `0x${string}` =>
  /^0x[a-fA-F0-9]{40}$/.test(s);

function parseWalletParams(sp: URLSearchParams): `0x${string}`[] {
  const raw = sp.getAll("wallet");
  const list = raw.length ? raw : [];
  const split = list.flatMap((v) => v.split(","));
  const cleaned = split
    .map((w) => w.trim().toLowerCase())
    .filter(isHexAddress);
  return [...new Set(cleaned)];
}

export default function WalletPicker({ selected }: { selected?: `0x${string}` }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { address } = useAccount();

  // derive wallets from URL
  const urlWallets = useMemo(() => parseWalletParams(new URLSearchParams(sp.toString())), [sp]);

  // local state mirrors URL but lets user stage edits
  const [wallets, setWallets] = useState<`0x${string}`[]>(urlWallets);
  const [input, setInput] = useState<string>("");

  // keep local state in sync with URL changes
  useEffect(() => {
    setWallets(urlWallets);
  }, [urlWallets]);

  // back-compat: if no URL wallets, seed from selected prop or connected address
  useEffect(() => {
    if (wallets.length === 0) {
      if (selected && isHexAddress(selected)) setWallets([selected.toLowerCase() as `0x${string}`]);
      else if (address && isHexAddress(address)) setWallets([address.toLowerCase() as `0x${string}`]);
    }
  }, [selected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  function pushToUrl(next: `0x${string}`[]) {
    const params = new URLSearchParams(sp.toString());
    params.delete("wallet");
    if (next.length) {
      // single param, comma-joined (also supports repeated keys if you prefer)
      params.set("wallet", next.join(","));
    }
    params.delete("page"); // reset pagination
    router.push(`?${params.toString()}`);
  }

  function add(addr: string) {
    const a = addr.trim().toLowerCase();
    if (!isHexAddress(a)) return;
    if (wallets.includes(a)) return;
    const next = [...wallets, a as `0x${string}`];
    setWallets(next);
    setInput("");
    pushToUrl(next);
  }

  function remove(addr: `0x${string}`) {
    const next = wallets.filter((w) => w !== addr);
    setWallets(next);
    pushToUrl(next);
  }

  function clearAll() {
    setWallets([]);
    pushToUrl([]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          className="border rounded px-2 py-1 w-[28rem] max-w-full"
          placeholder="Add wallet address (0x...) and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add(input);
          }}
        />
        <button
          className="border rounded px-2 py-1"
          onClick={() => add(input)}
          disabled={!/^0x[a-fA-F0-9]{40}$/.test(input.trim())}
        >
          Add
        </button>
        {address && isHexAddress(address) && (
          <button
            className="border rounded px-2 py-1"
            onClick={() => add(address)}
            disabled={wallets.includes(address.toLowerCase() as `0x${string}`)}
          >
            Use connected
          </button>
        )}
        {wallets.length > 0 && (
          <button className="border rounded px-2 py-1" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {wallets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {wallets.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs bg-muted/30"
              title={w}
            >
              {w.slice(0, 6)}…{w.slice(-4)}
              <button
                className="ml-1 border rounded px-1 py-0.5"
                onClick={() => remove(w)}
                aria-label={`Remove ${w}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
