"use client";

import { useMemo } from "react";
import { useBalance, useReadContracts } from "wagmi";
import { erc20Abi, erc721Abi, erc1155Abi } from "viem";

// Configure tracked assets
const TOKENS: { address: `0x${string}`; symbol?: string; decimals?: number }[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
];

const NFTS: { address: `0x${string}`; name: string; standard: "erc721" | "erc1155"; tokenIds?: bigint[] }[] = [
  { address: "0x57f1887A8BF19b14fC0dF6Fd9B2acc9Af147eA85", name: "ENS", standard: "erc721" },
];

export default function PortfolioAggregate({ wallets }: { wallets: `0x${string}`[] }) {
  // Native balances per wallet
  const native = wallets.map((w) =>
    useBalance({ address: w, query: { enabled: !!w } })
  );

  // ERC20 reads: for each token, fetch decimals and symbol once, then balanceOf per wallet
  const erc20Contracts = useMemo(() => {
    const list: any[] = [];
    for (const t of TOKENS) {
      list.push({ abi: erc20Abi, address: t.address, functionName: "decimals" as const });
      list.push({ abi: erc20Abi, address: t.address, functionName: "symbol" as const });
      for (const w of wallets) {
        list.push({ abi: erc20Abi, address: t.address, functionName: "balanceOf" as const, args: [w] });
      }
    }
    return list;
  }, [wallets]);

  const { data: erc20Data } = useReadContracts({
    contracts: erc20Contracts,
    query: { enabled: wallets.length > 0 && TOKENS.length > 0 },
  });

  const erc20Table = useMemo(() => {
    if (!erc20Data) return [];
    const rows: { token: string; perWallet: Record<string, string>; total: string }[] = [];
    let i = 0;
    for (const t of TOKENS) {
      const dec = (erc20Data[i++]?.result as number | undefined) ?? t.decimals ?? 18;
      const sym = (erc20Data[i++]?.result as string | undefined) ?? t.symbol ?? "TKN";
      let sum = 0;
      const per: Record<string, string> = {};
      for (const w of wallets) {
        const bal = (erc20Data[i++]?.result as bigint | undefined) ?? 0n;
        const val = Number(bal) / 10 ** dec;
        sum += val;
        per[w] = val.toLocaleString(undefined, { maximumFractionDigits: 6 });
      }
      rows.push({ token: sym, perWallet: per, total: sum.toLocaleString(undefined, { maximumFractionDigits: 6 }) });
    }
    return rows;
  }, [erc20Data, wallets]);

  // NFT reads: for each contract and wallet run balanceOf (721). For 1155, sum known tokenIds.
  const nftContracts = useMemo(() => {
    const list: any[] = [];
    for (const n of NFTS) {
      if (n.standard === "erc721") {
        for (const w of wallets) {
          list.push({ abi: erc721Abi, address: n.address, functionName: "balanceOf" as const, args: [w] });
        }
      } else {
        for (const w of wallets) {
          for (const id of n.tokenIds ?? []) {
            list.push({ abi: erc1155Abi, address: n.address, functionName: "balanceOf" as const, args: [w, id] });
          }
        }
      }
    }
    return list;
  }, [wallets]);

  const { data: nftData } = useReadContracts({
    contracts: nftContracts,
    query: { enabled: wallets.length > 0 && NFTS.length > 0 },
  });

  const nftTable = useMemo(() => {
    if (!nftData) return [];
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
        for (const w of wallets) {
          let wSum = 0n;
          for (const _ of n.tokenIds ?? []) {
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

  const nativeTable = (() => {
    const per: Record<string, string> = {};
    let symbol = "";
    for (let idx = 0; idx < wallets.length; idx++) {
      const b = native[idx]?.data;
      if (b) {
        const n = Number(b.value) / 10 ** b.decimals;
        per[wallets[idx]] = n.toLocaleString(undefined, { maximumFractionDigits: 6 });
        symbol = b.symbol;
      } else {
        per[wallets[idx]] = "0";
      }
    }
    // total
    const total = Object.values(per).reduce((s, v) => s + (Number(v.replace(/,/g, "")) || 0), 0);
    return { symbol, per, total: total.toLocaleString(undefined, { maximumFractionDigits: 6 }) };
  })();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Balances for selected wallets</h3>

      <div className="overflow-auto">
        <table className="min-w-[600px] text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Asset</th>
              {wallets.map(w => (
                <th key={w} className="text-right p-2">{w.slice(0,6)}…{w.slice(-4)}</th>
              ))}
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">{nativeTable.symbol || "Native"}</td>
              {wallets.map(w => (
                <td key={w} className="text-right p-2">{nativeTable.per[w]}</td>
              ))}
              <td className="text-right p-2">{nativeTable.total}</td>
            </tr>

            {erc20Table.map(row => (
              <tr key={row.token} className="border-t">
                <td className="p-2">{row.token}</td>
                {wallets.map(w => (
                  <td key={w} className="text-right p-2">{row.perWallet[w] ?? "0"}</td>
                ))}
                <td className="text-right p-2">{row.total}</td>
              </tr>
            ))}

            {nftTable.map(row => (
              <tr key={row.collection} className="border-t">
                <td className="p-2">{row.collection}</td>
                {wallets.map(w => (
                  <td key={w} className="text-right p-2">{row.perWallet[w] ?? "0"}</td>
                ))}
                <td className="text-right p-2">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {NFTS.some(n => n.standard === "erc1155" && !n.tokenIds?.length) && (
        <p className="text-xs text-muted-foreground">
          ERC1155 totals need known tokenIds. Full discovery requires an indexer.
        </p>
      )}
    </div>
  );
}
