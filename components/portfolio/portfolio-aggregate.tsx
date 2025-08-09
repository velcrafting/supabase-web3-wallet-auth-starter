"use client";

import { useMemo } from "react";
import { usePublicClient, useReadContracts } from "wagmi";
import { useQueries } from "@tanstack/react-query";
import { erc20Abi, erc721Abi, erc1155Abi, formatUnits } from "viem";

// ---- Configure tracked assets ----
const TOKENS: { address: `0x${string}`; symbol?: string; decimals?: number }[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
];

const NFTS: {
  address: `0x${string}`;
  name: string;
  standard: "erc721" | "erc1155";
  tokenIds?: bigint[];
}[] = [
  { address: "0x57f1887A8BF19b14fC0dF6Fd9B2acc9Af147eA85", name: "ENS", standard: "erc721" },
];

// ---- Helpers ----
function fmt(amount: bigint, decimals: number, maxFrac = 6) {
  const s = formatUnits(amount, decimals);
  // limit fraction digits without losing whole-part separators
  const [whole, frac = ""] = s.split(".");
  const trimmed = frac.substring(0, maxFrac).replace(/0+$/, "");
  return trimmed ? `${Number(whole).toLocaleString()}.${trimmed}` : Number(whole).toLocaleString();
}

export default function PortfolioAggregate({ wallets }: { wallets: `0x${string}`[] }) {
  const publicClient = usePublicClient();

  // Native balances per wallet via react-query (no dynamic hooks)
  const native = useQueries({
    queries: wallets.map((w) => ({
      queryKey: ["native-balance", publicClient?.chain?.id, w],
      enabled: !!publicClient && !!w,
      queryFn: async () => {
        if (!publicClient) return 0n;
        return publicClient.getBalance({ address: w });
      },
    })),
  });

  // ---- ERC20 batched reads ----
  const erc20Contracts = useMemo(() => {
    const list: any[] = [];
    for (const t of TOKENS) {
      list.push({ abi: erc20Abi, address: t.address, functionName: "decimals" as const });
      list.push({ abi: erc20Abi, address: t.address, functionName: "symbol" as const });
      for (const w of wallets) {
        list.push({
          abi: erc20Abi,
          address: t.address,
          functionName: "balanceOf" as const,
          args: [w],
        });
      }
    }
    return list;
  }, [wallets]);

  const { data: erc20Data } = useReadContracts({
    // viem types can be strict across mixed ABIs; keep pragmatic with any[]
    contracts: erc20Contracts as any[],
    query: { enabled: wallets.length > 0 && TOKENS.length > 0 },
  });

  const erc20Table = useMemo(() => {
    if (!erc20Data) return [] as { token: string; perWallet: Record<string, string>; total: string }[];

    const rows: { token: string; perWallet: Record<string, string>; total: string }[] = [];
    let i = 0;

    for (const t of TOKENS) {
      // read decimals, symbol, then balances in order
      const decimals =
        (erc20Data[i++]?.result as number | undefined) ??
        t.decimals ??
        18;

      const symbol =
        (erc20Data[i++]?.result as string | undefined) ??
        t.symbol ??
        "TOKEN";

      const per: Record<string, string> = {};
      let sum: bigint = 0n;

      for (const w of wallets) {
        const bal = (erc20Data[i++]?.result as bigint | undefined) ?? 0n;
        per[w] = fmt(bal, decimals);
        sum += bal;
      }

      rows.push({ token: symbol, perWallet: per, total: fmt(sum, decimals) });
    }

    return rows;
  }, [erc20Data, wallets]);

  // ---- NFT batched reads ----
  const nftContracts = useMemo(() => {
    const list: any[] = [];
    for (const n of NFTS) {
      if (n.standard === "erc721") {
        for (const w of wallets) {
          list.push({
            abi: erc721Abi,
            address: n.address,
            functionName: "balanceOf" as const,
            args: [w],
          });
        }
      } else {
        // For ERC1155 we need specific tokenIds to sum per wallet
        if (!n.tokenIds || n.tokenIds.length === 0) continue;
        for (const w of wallets) {
          for (const id of n.tokenIds) {
            list.push({
              abi: erc1155Abi,
              address: n.address,
              functionName: "balanceOf" as const,
              args: [w, id],
            });
          }
        }
      }
    }
    return list;
  }, [wallets]);

  const { data: nftData } = useReadContracts({
    contracts: nftContracts as any[],
    query: { enabled: wallets.length > 0 && NFTS.length > 0 },
  });

  const nftTable = useMemo(() => {
    if (!nftData) return [] as { collection: string; perWallet: Record<string, string>; total: string }[];

    const rows: { collection: string; perWallet: Record<string, string>; total: string }[] = [];
    let i = 0;

    for (const n of NFTS) {
      const per: Record<string, string> = {};
      let colSum = 0n;

      if (n.standard === "erc721") {
        for (const w of wallets) {
          const v = (nftData[i++]?.result as bigint | undefined) ?? 0n;
          per[w] = v.toString();
          colSum += v;
        }
      } else {
        // erc1155 totals across provided tokenIds
        if (!n.tokenIds || n.tokenIds.length === 0) {
          for (const w of wallets) per[w] = "—";
          rows.push({ collection: n.name, perWallet: per, total: "—" });
          continue;
        }
        for (const w of wallets) {
          let wSum = 0n;
          for (const _ of n.tokenIds) {
            const v = (nftData[i++]?.result as bigint | undefined) ?? 0n;
            wSum += v;
          }
          per[w] = wSum.toString();
          colSum += wSum;
        }
      }

      rows.push({ collection: n.name, perWallet: per, total: colSum.toString() });
    }

    return rows;
  }, [nftData, wallets]);

  // ---- Native row ----
  const nativeTable = useMemo(() => {
    const per: Record<string, string> = {};
    const decimals = publicClient?.chain?.nativeCurrency.decimals ?? 18;
    const symbol = publicClient?.chain?.nativeCurrency.symbol ?? "Native";

    let total = 0n;

    wallets.forEach((w, idx) => {
      const b = native[idx]?.data ?? 0n;
      per[w] = fmt(b, decimals);
      total += b;
    });

    return { symbol, per, total: fmt(total, decimals) };
  }, [native, wallets, publicClient]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Balances for selected wallets</h3>

      <div className="overflow-auto">
        <table className="min-w-[640px] text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Asset</th>
              {wallets.map((w) => (
                <th key={w} className="text-right p-2">
                  {w.slice(0, 6)}…{w.slice(-4)}
                </th>
              ))}
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>

          <tbody>
            {/* Native */}
            <tr className="border-t">
              <td className="p-2">{nativeTable.symbol}</td>
              {wallets.map((w) => (
                <td key={w} className="text-right p-2">
                  {nativeTable.per[w] ?? "0"}
                </td>
              ))}
              <td className="text-right p-2">{nativeTable.total}</td>
            </tr>

            {/* ERC20 */}
            {erc20Table.map((row) => (
              <tr key={row.token} className="border-t">
                <td className="p-2">{row.token}</td>
                {wallets.map((w) => (
                  <td key={w} className="text-right p-2">
                    {row.perWallet[w] ?? "0"}
                  </td>
                ))}
                <td className="text-right p-2">{row.total}</td>
              </tr>
            ))}

            {/* NFTs */}
            {nftTable.map((row) => (
              <tr key={row.collection} className="border-t">
                <td className="p-2">{row.collection}</td>
                {wallets.map((w) => (
                  <td key={w} className="text-right p-2">
                    {row.perWallet[w] ?? "0"}
                  </td>
                ))}
                <td className="text-right p-2">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {NFTS.some((n) => n.standard === "erc1155" && (!n.tokenIds || n.tokenIds.length === 0)) && (
        <p className="text-xs text-muted-foreground">
          ERC1155 totals need known tokenIds. Full discovery requires an indexer.
        </p>
      )}
    </div>
  );
}
