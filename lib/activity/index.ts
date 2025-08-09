export function short(address?: string) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
}

export function fmt(meta: any) {
  const d = typeof meta?.decimals === "number" ? meta.decimals : 18;
  const v = meta?.amount ? Number(BigInt(meta.amount)) / 10 ** d : 0;
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${meta?.symbol ?? ""}`.trim();
}

export function formatAction(action: string, meta: any) {
  if (action === "transfer_in") return `Received ${fmt(meta)}`;
  if (action === "transfer_out") return `Sent ${fmt(meta)}`;
  if (action === "nft_balance")
    return `NFT balance updated for ${meta?.collectionName ?? meta?.contract ?? ""}`;
  if (action === "approval") return `Approval set for ${meta?.spender ?? ""}`;
  return action;
}