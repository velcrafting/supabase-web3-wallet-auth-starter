export function formatWalletAddress(
  metadata?: { wallet?: string; walletAddress?: string }
) {
  const wallet = metadata?.wallet ?? metadata?.walletAddress;
  return wallet
    ? `${String(wallet).slice(0, 6)}…${String(wallet).slice(-4)}`
    : undefined;
}
